"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const getAllDocuments = async (threshold?: number) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const documents = await db.document.findMany({
    where: {
      OR: [
        { userId: user.id },
        { collaborators: { some: { userId: user.id } } },
      ],
    },
    orderBy: { lastEditedAt: "desc" },
    take: threshold ?? undefined,
    include: {
      lastEditedBy: true,
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return documents;
};
