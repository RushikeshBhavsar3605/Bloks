"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const getSearch = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const documents = await db?.document.findMany({
    where: {
      OR: [
        { userId: user.id },
        { collaborators: { some: { userId: user.id } } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return documents;
};
