import { db } from "@/lib/db";

export const verifyUserSession = async (userId: string): Promise<boolean> => {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    return !!user;
  } catch (error) {
    console.error("[USER_VERIFICATION]", error);
    return false;
  }
};

export const verifyDocumentAccess = async (
  documentId: string,
  userId: string
): Promise<boolean> => {
  try {
    const document = await db.document.findUnique({
      where: { id: documentId },
      select: {
        userId: true,
        isArchived: true,
        collaborators: {
          where: {
            userId,
            isVerified: { not: null },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!document) return false;

    return document?.userId === userId || document.collaborators.length > 0;
  } catch (error) {
    console.log("[SOCKET_DOCUMENT_ACCESS]", error);
    return false;
  }
};

export const isDocumentOwner = async (
  documentId: string,
  userId: string
): Promise<boolean> => {
  try {
    const document = await db.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });

    return !!document;
  } catch (error) {
    console.log("[SOCKET_DOCUMENT_OWNER]", error);
    return false;
  }
};
