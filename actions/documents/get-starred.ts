"use server";

import { db } from "@/lib/db";

export const getStarred = async ({
  userId,
  documentId,
}: {
  userId: string;
  documentId: string;
}) => {
  const starred = await db.star.findUnique({
    where: {
      userId_documentId: {
        userId,
        documentId,
      },
    },
  });

  return starred;
};
