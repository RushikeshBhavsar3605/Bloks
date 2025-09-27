"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Document, User } from "@prisma/client";

type customDocumentWithMeta = Document & {
  lastEditedBy: User | null;
};

interface PaginatedStarredDocumentsResponse {
  documents: customDocumentWithMeta[];
  hasMore: boolean;
  total: number;
}

export const getStarredDocumentsPaginated = async (
  limit: number = 10,
  offset: number = 0,
  searchQuery: string = ""
): Promise<PaginatedStarredDocumentsResponse> => {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return {
        documents: [],
        hasMore: false,
        total: 0,
      };
    }

    // Build where clause for starred documents with optional search
    const whereClause = {
      stars: {
        some: {
          userId: user.id,
        },
      },
      OR: [
        { userId: user.id }, // User's own documents
        {
          collaborators: {
            some: { userId: user.id }, // Documents where user is a collaborator
          },
        },
      ],
      ...(searchQuery && {
        AND: {
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              content: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
          ],
        },
      }),
    };

    // Get total count for hasMore calculation
    const totalCount = await db.document.count({
      where: whereClause,
    });

    // Get paginated starred documents
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
    console.error("Error fetching paginated starred documents:", error);
    return {
      documents: [],
      hasMore: false,
      total: 0,
    };
  }
};
