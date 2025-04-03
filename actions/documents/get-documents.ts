"use server";

import { currentUser } from "@/lib/auth";

export const getAllDocuments = async (parentDocument?: string) => {
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

export const getDocument = async (documentId: string) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const document = await prisma?.document.findUnique({
    where: {
      userId: user.id,
      id: documentId,
    },
  });

  return document;
};

export const getAllTrashDocuments = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const documents = await prisma?.document.findMany({
    where: {
      userId: user.id,
      isArchived: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return documents;
};
