"use server";

import { currentUser } from "@/lib/auth";

export const getSearch = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const documents = await prisma?.document.findMany({
    where: {
      userId: user.id,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return documents;
};
