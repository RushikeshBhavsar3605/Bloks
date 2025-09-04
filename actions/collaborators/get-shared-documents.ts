"use server";

import { db } from "@/lib/db";

export const getSharedDocuments = async (userId: string) => {
  const owned = await db.document.count({
    where: {
      userId,
    },
  });

  const coauthored = await db.collaborator.count({
    where: {
      userId,
    },
  });

  return { owned, coauthored };
};
