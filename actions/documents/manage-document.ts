"use server";

import { currentUser } from "@/lib/auth";
import { getAllDocuments, getDocument } from "./get-documents";

export const archive = async (documentId: string) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const existingDocument = await getDocument(documentId);

  if (!existingDocument) {
    throw new Error("Not found");
  }

  if (existingDocument.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  const recursiveArchive = async (documentId: string) => {
    const children = await getAllDocuments(documentId);

    if (!children) return;

    for (const child of children) {
      await prisma?.document.update({
        where: {
          id: child.id,
        },
        data: {
          isArchived: true,
        },
      });

      await recursiveArchive(child.id);
    }
  };

  const document = await prisma?.document.update({
    where: {
      id: documentId,
    },
    data: {
      isArchived: true,
    },
  });

  await recursiveArchive(documentId);

  return document;
};
