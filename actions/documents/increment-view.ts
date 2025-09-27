"use server";

import { db } from "@/lib/db";

export const incrementView = async (documentId: string) => {
  const document = await db.document.findUnique({
    where: {
      id: documentId,
      isPublished: true,
    },
    select: {
      views: true,
    },
  });

  if (document === null || document?.views === null) {
    return null;
  }

  const doc = await db.document.update({
    where: {
      id: documentId,
      isPublished: true,
    },
    data: {
      views: document.views + 1,
    },
  });
};
