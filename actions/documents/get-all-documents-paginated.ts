"use server";

import { db } from "@/lib/db";
import { Document, User } from "@prisma/client";
import { currentUser } from "@/lib/auth";

type customDocumentWithMeta = Document & {
  lastEditedBy: User | null;
  owner: {
    name: string | null;
    email: string | null;
  };
};

interface PaginatedDocumentsResponse {
  documents: customDocumentWithMeta[];
  hasMore: boolean;
  total: number;
}

export const getAllDocumentsPaginated = async (
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedDocumentsResponse> => {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return {
        documents: [],
        hasMore: false,
        total: 0,
      };
    }

    // Build where clause for user's documents and collaborated documents
    const whereClause = {
      isArchived: false,
      OR: [
        {
          userId: user.id, // User's own documents
        },
        {
          collaborators: {
            some: {
              userId: user.id, // Documents where user is a collaborator
            },
          },
        },
      ],
    };

    // Get total count for hasMore calculation
    const totalCount = await db.document.count({
      where: whereClause,
    });

    // Get paginated documents
    const documents = await db.document.findMany({
      where: whereClause,
      include: {
        lastEditedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { lastEditedAt: "desc" },
        { updatedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      skip: offset,
    });

    const hasMore = offset + limit < totalCount;

    return {
      documents: documents as customDocumentWithMeta[],
      hasMore,
      total: totalCount,
    };
  } catch (error) {
    console.error("Error fetching paginated documents:", error);
    return {
      documents: [],
      hasMore: false,
      total: 0,
    };
  }
};
