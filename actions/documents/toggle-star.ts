"use server";

import { db } from "@/lib/db";

export const toggleStar = async ({
  userId,
  documentId,
}: {
  userId: string;
  documentId: string;
}) => {
  const existing = await db.star.findUnique({
    where: {
      userId_documentId: {
        userId,
        documentId,
      },
    },
  });

  if (existing) {
    await db.star.deleteMany({
      where: {
        userId,
        documentId,
      },
    });

    return { starred: false };
  } else {
    await db.star.create({
      data: {
        userId,
        documentId,
      },
    });

    return { starred: true };
  }
};
