"use server";

import { currentUser } from "@/lib/auth";

export const getDocuments = async (parentDocument?: string) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const documents = await prisma?.document.findMany({
    where: {
      userId: user.id,
      parentDocumentId: parentDocument || "",
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return documents;
};
