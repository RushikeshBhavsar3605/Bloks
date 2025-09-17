"use server";

import { db } from "@/lib/db";

export const getPreviewDocument = async (documentId: string) => {
  const document = await db.document.findUnique({
    where: {
      id: documentId,
      isPublished: true,
    },
    include: {
      owner: {
        select: {
          name: true,
          image: true,
          email: true,
        },
      },
    },
  });

  if (!document) {
    return null;
  }

  return { ...document, isOwner: false, role: null };
};
