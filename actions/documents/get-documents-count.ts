"use server";

import { db } from "@/lib/db";

export const getDocumentsCount = async (userId: string) => {
  const latestDoc = await db.document.findFirst({
    where: {
      userId,
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const count = await db.document.count({ where: { userId } });

  return { count, date: latestDoc?.createdAt || null };
};
