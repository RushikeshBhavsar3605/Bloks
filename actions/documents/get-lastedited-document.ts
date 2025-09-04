"use server";

import { db } from "@/lib/db";

export const getLasteditedDocument = async (userId: string) => {
  try {
    const ownedDocument = await db.document.findFirst({
      where: {
        userId,
      },
      orderBy: { lastEditedAt: "desc" },
      select: {
        id: true,
        title: true,
        lastEditedAt: true,
        lastEditedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const collaboratingDocument = await db.collaborator.findFirst({
      where: {
        userId,
      },
      orderBy: {
        document: {
          lastEditedAt: "desc",
        },
      },
      select: {
        document: {
          select: {
            id: true,
            title: true,
            lastEditedAt: true,
            lastEditedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!ownedDocument && !collaboratingDocument)
      return { id: "", name: "", date: null };

    if (!ownedDocument && collaboratingDocument)
      return {
        id: collaboratingDocument.document.lastEditedBy?.id as string,
        name: collaboratingDocument.document.lastEditedBy?.name as string,
        date: collaboratingDocument.document.lastEditedAt,
      };
    if (!collaboratingDocument && ownedDocument)
      return {
        id: ownedDocument.lastEditedBy?.id as string,
        name: ownedDocument.lastEditedBy?.name as string,
        date: ownedDocument.lastEditedAt,
      };

    if (
      ownedDocument?.lastEditedAt &&
      collaboratingDocument?.document.lastEditedAt
    )
      return ownedDocument.lastEditedAt >
        collaboratingDocument.document.lastEditedAt
        ? {
            id: ownedDocument.lastEditedBy?.id as string,
            name: ownedDocument.lastEditedBy?.name as string,
            date: ownedDocument.lastEditedAt,
          }
        : {
            id: collaboratingDocument.document.lastEditedBy?.id as string,
            name: collaboratingDocument.document.lastEditedBy?.name as string,
            date: collaboratingDocument.document.lastEditedAt,
          };

    return { id: "", name: "", date: null };
  } catch (error) {
    console.error("Error fetching last edited document:", error);
    throw new Error("Failed to fetch last edited document");
    return { id: "", name: "", date: null };
  }
};
