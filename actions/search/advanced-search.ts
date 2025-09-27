"use server";

import { db } from "@/lib/db";
import { Document, User } from "@prisma/client";

export interface SearchResult {
  id: string;
  type: "document" | "user";
  title: string;
  content?: string;
  preview?: string;
  icon?: string;
  author?: string;
  workspace?: string;
  lastModified?: string;
  url?: string;
  category?: string;
  tags?: string[];
}

interface AdvancedSearchResponse {
  documents: SearchResult[];
  users: SearchResult[];
  total: number;
}

export const advancedSearch = async (
  searchQuery: string,
  userId: string,
  limit: number = 10
): Promise<AdvancedSearchResponse> => {
  try {
    if (!searchQuery.trim()) {
      return { documents: [], users: [], total: 0 };
    }

    const searchTerm = searchQuery.toLowerCase();

    // Search documents
    const documentsPromise = db.document.findMany({
      where: {
        OR: [
          { userId: userId }, // User's own documents
          {
            // Documents where user is a collaborator
            collaborators: {
              some: {
                userId: userId,
              },
            },
          },
        ],
        AND: {
          isArchived: false,
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
          ],
        },
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { updatedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: limit, // Get more than needed for smart distribution
    });

    // Search coeditor users
    const usersPromise = db.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
            ],
          },
          {
            // Only users who are coeditors with the current user
            OR: [
              {
                // Users who have collaborated on current user's documents
                collaborations: {
                  some: {
                    document: {
                      userId: userId,
                    },
                  },
                },
              },
              {
                // Users whose documents the current user has collaborated on
                documents: {
                  some: {
                    collaborators: {
                      some: {
                        userId: userId,
                      },
                    },
                  },
                },
              },
            ],
          },
          {
            // Exclude the current user
            id: {
              not: userId,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit, // Get more than needed for smart distribution
    });

    const [documents, users] = await Promise.all([documentsPromise, usersPromise]);

    // Smart distribution logic
    const totalFound = documents.length + users.length;
    let documentsToReturn: typeof documents = [];
    let usersToReturn: typeof users = [];

    if (totalFound <= limit) {
      // If total results are within limit, return all
      documentsToReturn = documents;
      usersToReturn = users;
    } else {
      // Smart distribution based on availability
      if (documents.length >= limit / 2 && users.length >= limit / 2) {
        // Both have enough results, split 50/50
        documentsToReturn = documents.slice(0, Math.floor(limit / 2));
        usersToReturn = users.slice(0, Math.ceil(limit / 2));
      } else if (documents.length < limit / 2) {
        // Not enough documents, give more space to users
        documentsToReturn = documents;
        usersToReturn = users.slice(0, limit - documents.length);
      } else {
        // Not enough users, give more space to documents
        usersToReturn = users;
        documentsToReturn = documents.slice(0, limit - users.length);
      }
    }

    // Convert documents to search results
    const documentResults: SearchResult[] = documentsToReturn.map((doc) => ({
      id: doc.id,
      type: "document" as const,
      title: doc.title,
      content: doc.content || "",
      preview: doc.content ? doc.content.substring(0, 200) + "..." : "",
      icon: doc.icon || undefined,
      author: doc.owner.name || "Unknown",
      workspace: `${doc.owner.name}'s Workspace`,
      lastModified: formatLastModified(doc.updatedAt),
      url: `/documents/${doc.id}`,
      category: "Document",
      tags: [],
    }));

    // Convert users to search results
    const userResults: SearchResult[] = usersToReturn.map((user) => ({
      id: user.id,
      type: "user" as const,
      title: user.name || "Unknown User",
      content: `${user.name || "Unknown"} - ${user.email || "No email"}`,
      preview: `Collaborator in ${user.name}'s workspace`,
      icon: undefined,
      author: user.name || "Unknown",
      workspace: `${user.name}'s Workspace`,
      lastModified: "Active collaborator",
      url: `/settings`,
      category: "Collaborator",
      tags: ["collaborator", "user", "team"],
    }));

    return {
      documents: documentResults,
      users: userResults,
      total: documentResults.length + userResults.length,
    };
  } catch (error) {
    console.error("Error in advanced search:", error);
    return { documents: [], users: [], total: 0 };
  }
};

// Helper function to format last modified date
const formatLastModified = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};