"use server";

import { currentUser } from "@/lib/auth";
import { getAllDocuments, getDocument } from "./get-documents";

// ❌ Deprecated: This server action has been replaced by `/api/socket/document/archive`
// Reason: Switched to API route for real-time socket support
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

// ❌ Deprecated: This server action has been replaced by `/api/socket/document/restore`
// Reason: Switched to API route for real-time socket support
export const restoreDocument = async (documentId: string) => {
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

  const recursiveRestore = async (documentId: string) => {
    const children = await prisma?.document.findMany({
      where: {
        userId: user.id,
        parentDocumentId: documentId,
      },
    });

    if (!children) return;

    for (const child of children) {
      await prisma?.document.update({
        where: {
          id: child.id,
        },
        data: {
          isArchived: false,
        },
      });

      await recursiveRestore(child.id);
    }
  };

  const options: Partial<{ isArchived: boolean; parentDocumentId: string }> = {
    isArchived: false,
  };

  if (
    existingDocument.parentDocumentId &&
    existingDocument.parentDocumentId != ""
  ) {
    const parent = await getDocument(existingDocument.parentDocumentId);
    if (parent?.isArchived) {
      options.parentDocumentId = "";
    }
  }

  const document = await prisma?.document.update({
    where: {
      id: documentId,
    },
    data: options,
  });

  await recursiveRestore(documentId);

  return document;
};

// ❌ Deprecated: This server action has been replaced by `/api/socket/document/remove`
// Reason: Switched to API route for real-time socket support
export const removeDocument = async (documentId: string) => {
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

  const recursiveRemove = async (documentId: string) => {
    const children = await prisma?.document.findMany({
      where: {
        userId: user.id,
        parentDocumentId: documentId,
      },
    });

    if (!children) return;

    for (const child of children) {
      await recursiveRemove(child.id);

      await prisma?.document.delete({
        where: {
          id: child.id,
        },
      });
    }
  };

  await recursiveRemove(documentId);

  const document = await prisma?.document.delete({
    where: {
      id: documentId,
    },
  });

  return document;
};

// ❌ Deprecated: This server action has been replaced by `/api/socket/document/update-document`
// Reason: Switched to API route for real-time socket support
export const updateDocument = async (data: {
  id: string;
  title?: string;
  content?: string;
  coverImage?: string;
  icon?: string;
  isPublished?: boolean;
}) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const existingDocument = await prisma?.document.findUnique({
    where: {
      id: data.id,
    },
  });

  if (!existingDocument) {
    throw new Error("Not found");
  }

  if (existingDocument.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  const { id, ...rest } = data;

  const document = await prisma?.document.update({
    where: {
      id,
    },
    data: rest,
  });

  return document;
};
