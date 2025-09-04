"use server";

import { db } from "@/lib/db";

export const getCoeditors = async (userId: string) => {
  const [collaboratingDocuments, documents] = await Promise.all([
    // Fetch all documents where user is a collaborator
    db.collaborator.findMany({
      where: { userId },
      select: { documentId: true },
    }),

    // Get all documents owned by user with their collaborators
    db.document.findMany({
      where: { userId },
      include: { collaborators: { select: { userId: true } } },
    }),
  ]);

  // Filter documents with collaborators
  const collaboratedDocuments = documents.filter(
    (doc) => doc.collaborators.length > 0
  );

  // Get document IDs for invited documents
  const invitedDocumentIds = collaboratingDocuments.map(
    (doc) => doc.documentId
  );

  // Fetch collaborators for invited documents in single query
  const invitedDocumentsCollaborators = await db.collaborator.findMany({
    where: { documentId: { in: invitedDocumentIds } },
    select: { userId: true },
  });

  // Extract unique collaborator IDs
  const collaboratorIds = new Set<string>();

  // Add collaborators from invited documents
  invitedDocumentsCollaborators.forEach((collab) =>
    collaboratorIds.add(collab.userId)
  );

  // Add collaborators from owned documents
  collaboratedDocuments.forEach((doc) => {
    doc.collaborators.forEach((collab) => collaboratorIds.add(collab.userId));
  });

  // Remove the current user from collaborators count
  collaboratorIds.delete(userId);

  return {
    totalUniqueCollaborators: collaboratorIds.size,
    count: collaboratingDocuments.length + collaboratedDocuments.length,
  };
};
