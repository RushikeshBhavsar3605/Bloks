"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const publishDocument = async (documentId: string) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const document = await db.document.findUnique({
    where: {
      id: documentId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!document || user.id != document.userId) {
    throw new Error("Not authorized");
  }

  return db.document.update({
    where: {
      id: document.id,
    },
    data: {
      isPublished: true,
    },
  });
};
