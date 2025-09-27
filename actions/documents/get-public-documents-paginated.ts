"use server";

import { db } from "@/lib/db";
import { DocumentWithMeta } from "@/types/shared";

interface PaginatedDocumentsResponse {
  documents: DocumentWithMeta[];
  hasMore: boolean;
  total: number;
}

export const getPublicDocumentsPaginated = async (
  limit: number = 10,
  offset: number = 0,
  searchQuery: string = ""
): Promise<PaginatedDocumentsResponse> => {
  try {
    // Build where clause for search
    const whereClause = {
      isPublished: true,
      isArchived: false,
      ...(searchQuery && {
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
      }),
    };

    // Get total count for hasMore calculation
    const totalCount = await db.document.count({
      where: whereClause,
    });

    // Get paginated documents
    const documents = await db.document.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      skip: offset,
    });

    const hasMore = offset + limit < totalCount;

    return {
      documents: documents as DocumentWithMeta[],
      hasMore,
      total: totalCount,
    };
  } catch (error) {
    console.error("Error fetching paginated public documents:", error);
    return {
      documents: [],
      hasMore: false,
      total: 0,
    };
  }
};