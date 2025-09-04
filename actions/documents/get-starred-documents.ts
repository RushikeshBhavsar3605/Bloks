"use server";

import { db } from "@/lib/db";

export const getStarredDocuments = async (userId: string) => {
  try {
    const starredDocuments = await db.document.findMany({
      where: {
        stars: {
          some: {
            userId,
          },
        },
        OR: [
          { userId },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        lastEditedBy: true,
      },
    });

    return starredDocuments;
  } catch (error) {
    console.error("Error fetching last edited document:", error);
    throw new Error("Failed to fetch last edited document");
  }
};
