"use server";

import { currentUser } from "@/lib/auth";

// ❌ Deprecated: This server action has been replaced by `/api/socket/document/fetch-all`
// Reason: Switched to API route for real-time socket support
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

// ❌ Deprecated: This helper server action has been un longer used
// Reason: Calling server action has been Deprecated
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

// ❌ Deprecated: This server action has been replaced by `/api/socket/document/create`
// Reason: Switched to API route for real-time socket support
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

export const getDocumentById = async (documentId: string) => {
  const user = await currentUser();

  const document = await prisma?.document.findUnique({
    where: {
      id: documentId,
    },
  });

  if (!document) {
    throw new Error("Not found");
  }

  if (document.isPublished && !document.isArchived) {
    return document;
  }

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (document.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  return document;
};
