import { db } from "@/lib/db";
import { DocumentWithMeta } from "@/types/shared";
import { CollaboratorRole, Document } from "@prisma/client";

type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};

interface DocumentActionProps {
  userId: string;
  documentId: string;
}

interface CreateDocumentProps {
  userId: string;
  title: string;
  parentDocumentId?: string;
}

interface UpdateDocumentProps extends DocumentActionProps {
  content?: string;
  title?: string;
  coverImage?: string;
  icon?: string;
  isPublished?: boolean;
}

// DOCUMENT ACCESS FUNCTIONS

/**
 * Gets direct access information for a document
 * Returns role and access status without checking ancestors
 */
export const getDirectDocumentAccess = async (
  documentId: string,
  userId: string
): Promise<ServiceResponse<any>> => {
  try {
    const document = await db.document.findUnique({
      where: { id: documentId },
      select: {
        userId: true,
        collaborators: {
          where: {
            userId,
            isVerified: { not: null },
          },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        data: { hasAccess: false },
        error: "Document not found",
        status: 404,
      };
    }

    // User is the owner
    if (document.userId === userId) {
      return {
        success: true,
        data: {
          hasAccess: true,
          isOwner: true,
          role: "OWNER",
        },
        status: 200,
      };
    }

    // User is a collaborator
    if (document.collaborators.length > 0) {
      return {
        success: true,
        data: {
          hasAccess: true,
          isOwner: false,
          role: document.collaborators[0].role,
        },
        status: 200,
      };
    }

    return {
      success: false,
      data: {
        hasAccess: false,
        isOwner: false,
        role: null,
      },
      error: "No access to this document",
      status: 403,
    };
  } catch (error) {
    console.error("[GET_DIRECT_DOCUMENT_ACCESS]", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      status: 500,
    };
  }
};

// DOCUMENT OPERATIONS

/**
 * Creates a new document and propagates parent collaborators if needed
 */
export const createDocument = async ({
  userId,
  title,
  parentDocumentId,
}: CreateDocumentProps): Promise<ServiceResponse<DocumentWithMeta>> => {
  try {
    // Check access rights (must be owner or EDITOR)
    if (parentDocumentId) {
      const access = await getDirectDocumentAccess(parentDocumentId, userId);

      if (!access.success || !access.data?.hasAccess) {
        return {
          success: false,
          error: "Document not found or no access",
          status: 404,
        };
      }

      if (!access.data.isOwner) {
        return {
          success: false,
          error: "You don't have permission to restore this document",
          status: 403,
        };
      }
    }

    // Create the document first
    const document = await db.document.create({
      data: {
        title,
        userId,
        parentDocumentId: parentDocumentId || "",
        isArchived: false,
        isPublished: false,
        content: "",
      },
    });

    // If there's a parent, inherit collaborators
    if (parentDocumentId) {
      // Get parent document collaborators
      const parentCollaborators = await db.collaborator.findMany({
        where: {
          documentId: parentDocumentId,
          isVerified: { not: null },
        },
      });

      // Add the same collaborators to this document
      if (parentCollaborators.length > 0) {
        await Promise.all(
          parentCollaborators.map((collab) =>
            db.collaborator.create({
              data: {
                documentId: document.id,
                userId: collab.userId,
                role: collab.role,
                isVerified: collab.isVerified,
              },
            })
          )
        );
      }
    }

    const existingDocument = await db.document.findUnique({
      where: {
        id: document.id,
      },
      include: {
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!existingDocument) {
      return {
        success: false,
        error: "Document not found!",
        status: 404,
      };
    }

    return {
      success: true,
      data: { ...existingDocument, isOwner: true, role: "OWNER" },
      status: 200,
    };
  } catch (error) {
    console.error("[CREATE_DOCUMENT]", error);
    return {
      success: false,
      error: "Failed to create document",
      status: 500,
    };
  }
};

/**
 * Fetches all documents where the user is either the owner or a collaborator
 * with the specified parent document ID
 */
export const fetchDocuments = async ({
  userId,
  documentId: parentDocumentId,
}: DocumentActionProps): Promise<ServiceResponse<DocumentWithMeta[]>> => {
  try {
    // Get documents where user is owner OR collaborator with the given parent ID
    const documents = await db.document.findMany({
      where: {
        parentDocumentId,
        isArchived: false,
        OR: [
          { userId }, // Owner
          {
            collaborators: {
              some: {
                userId,
                isVerified: { not: null },
              },
            },
          }, // Collaborator
        ],
      },
      include: {
        collaborators: {
          where: {
            userId,
          },
        },
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Enhance documents with role information
    const enhancedDocuments = documents.map((doc) => {
      const { collaborators, ...docWithoutCollaborators } = doc;
      const isOwner = doc.userId === userId;
      const role: CollaboratorRole | "OWNER" | null = isOwner
        ? "OWNER"
        : collaborators.length > 0
        ? collaborators[0].role
        : null;

      return {
        ...docWithoutCollaborators,
        isOwner,
        role,
      };
    });

    return {
      success: true,
      data: enhancedDocuments,
      status: 200,
    };
  } catch (error) {
    console.error("[FETCH_DOCUMENTS]", error);
    return {
      success: false,
      error: "Failed to fetch documents",
      status: 500,
    };
  }
};

/**
 * Gets all top-level documents (no parent) for the sidebar
 * Separates user's documents and shared documents
 */
export const getRootDocuments = async (
  userId: string
): Promise<
  ServiceResponse<{
    ownedDocuments: Document[];
    sharedDocuments: DocumentWithMeta[];
  }>
> => {
  try {
    // Fetch documents owned by the user
    const ownedDocuments = await db.document.findMany({
      where: {
        userId,
        isArchived: false,
        parentDocumentId: "",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch documents where user is a collaborator
    const collaboratedDocuments = await db.document.findMany({
      where: {
        collaborators: {
          some: {
            userId,
            isVerified: { not: null }, // Only include verified collaborations
          },
        },
        isArchived: false,
      },
      include: {
        collaborators: {
          where: {
            userId,
          },
        },
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const sharedDocuments = [];

    for (const doc of collaboratedDocuments) {
      // 1. Include root documents (parentDocumentId is null)
      if (doc.parentDocumentId === null) {
        sharedDocuments.push(doc);
        continue;
      }

      // 2. For child documents, check if the parent is shared with the user
      const parentCollaborator = await db.collaborator.findUnique({
        where: {
          userId_documentId: {
            documentId: doc.parentDocumentId,
            userId,
          },
        },
      });

      // 3. If the parent document is not shared with the user, include the document
      if (!parentCollaborator) {
        sharedDocuments.push(doc);
      }
    }

    const enhancedSharedDocuments = sharedDocuments.map((doc) => {
      const { collaborators, ...docWithoutCollaborators } = doc;
      const isOwner = doc.userId === userId;
      const role: CollaboratorRole | "OWNER" | null = isOwner
        ? "OWNER"
        : collaborators.length > 0
        ? collaborators[0].role
        : null;

      return {
        ...docWithoutCollaborators,
        isOwner,
        role,
      };
    });

    return {
      success: true,
      data: { ownedDocuments, sharedDocuments: enhancedSharedDocuments },
      status: 200,
    };
  } catch (error) {
    console.error("[GET_ROOT_DOCUMENTS]", error);
    return {
      success: false,
      data: { ownedDocuments: [], sharedDocuments: [] },
      error: "Failed to get documents",
      status: 500,
    };
  }
};

/**
 * Gets all documents accessible to the user (for search functionality)
 */
export const getAllAccessibleDocuments = async (
  userId: string
): Promise<ServiceResponse<DocumentWithMeta[]>> => {
  try {
    const documents = await db.document.findMany({
      where: {
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                isVerified: { not: null },
              },
            },
          },
        ],
      },
      include: {
        collaborators: {
          where: {
            userId,
          },
        },
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add role and ownership information
    const enhancedDocuments = documents.map((doc) => {
      const { collaborators, ...docWithoutCollaborators } = doc;
      const isOwner = doc.userId === userId;
      const role: CollaboratorRole | "OWNER" | null = isOwner
        ? "OWNER"
        : collaborators.length > 0
        ? collaborators[0].role
        : null;

      return {
        ...docWithoutCollaborators,
        isOwner,
        role,
      };
    });

    return {
      success: true,
      data: enhancedDocuments,
      status: 200,
    };
  } catch (error) {
    console.error("[GET_ALL_ACCESSIBLE_DOCUMENTS]", error);
    return {
      success: false,
      data: [],
      error: "Failed to retrieve documents",
      status: 500,
    };
  }
};

/**
 * Gets all archived documents accessible to the user
 */
export const getArchivedDocuments = async (
  userId: string
): Promise<
  ServiceResponse<{
    ownedArchived: DocumentWithMeta[];
    sharedArchived: DocumentWithMeta[];
  }>
> => {
  try {
    // Get archived documents owned by the user
    const ownedArchived = await db.document.findMany({
      where: {
        userId,
        isArchived: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get archived documents where user is a collaborator
    const sharedArchived = await db.document.findMany({
      where: {
        collaborators: {
          some: {
            userId,
            isVerified: { not: null },
          },
        },
        isArchived: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        collaborators: {
          where: {
            userId,
          },
        },
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Enhance with role information
    const enhancedOwnedArchived = ownedArchived.map((doc) => {
      const isOwner = true;
      const role: CollaboratorRole | "OWNER" | null = "OWNER";

      return {
        ...doc,
        owner: {
          name: null,
          image: null,
        },
        isOwner,
        role,
      };
    });

    // Add isOwner and role for shared documents
    const enhancedSharedArchived = sharedArchived.map((doc) => {
      const { collaborators, ...docWithoutCollaborators } = doc;
      const isOwner = false;
      const role: CollaboratorRole | "OWNER" | null =
        collaborators.length > 0 ? collaborators[0].role : null;

      return {
        ...docWithoutCollaborators,
        isOwner,
        role,
      };
    });

    return {
      success: true,
      data: {
        ownedArchived: enhancedOwnedArchived,
        sharedArchived: enhancedSharedArchived,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[GET_ARCHIVED_DOCUMENTS]", error);
    return {
      success: false,
      data: { ownedArchived: [], sharedArchived: [] },
      error: "Failed to fetch archived documents",
      status: 500,
    };
  }
};

/**
 * Archives a document and all its children
 */
export const archiveDocument = async ({
  userId,
  documentId,
}: DocumentActionProps): Promise<
  ServiceResponse<{ id: string; isArchived: boolean }>
> => {
  try {
    // Check access rights (must be owner or EDITOR)
    const access = await getDirectDocumentAccess(documentId, userId);

    if (!access.success || !access.data?.hasAccess) {
      return {
        success: false,
        error: "Document not found or no access",
        status: 404,
      };
    }

    if (!access.data.isOwner && access.data.role !== "EDITOR") {
      return {
        success: false,
        error: "You don't have permission to archive this document",
        status: 403,
      };
    }

    // Find the document and its children
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: { childDocuments: true },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found",
        status: 404,
      };
    }

    // Recursively archive all children
    const archiveRecursively = async (docId: string) => {
      const children = await db.document.findMany({
        where: { parentDocumentId: docId },
        select: { id: true },
      });

      // Archive the current document
      await db.document.update({
        where: { id: docId },
        data: { isArchived: true },
      });

      // Archive all children
      for (const child of children) {
        await archiveRecursively(child.id);
      }
    };

    await archiveRecursively(documentId);

    return {
      success: true,
      data: {
        id: documentId,
        isArchived: true,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[ARCHIVE_DOCUMENT]", error);
    return {
      success: false,
      error: "Failed to archive document",
      status: 500,
    };
  }
};

/**
 * Restores a document and all its children from archive
 */
export const restoreDocument = async ({
  userId,
  documentId,
}: DocumentActionProps): Promise<ServiceResponse<DocumentWithMeta>> => {
  try {
    // Check access rights (must be owner or EDITOR)
    const access = await getDirectDocumentAccess(documentId, userId);

    if (!access.success || !access.data?.hasAccess) {
      return {
        success: false,
        error: "Document not found or no access",
        status: 404,
      };
    }

    if (!access.data.isOwner && access.data.role !== "EDITOR") {
      return {
        success: false,
        error: "You don't have permission to restore this document",
        status: 403,
      };
    }

    let document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found",
        status: 404,
      };
    }

    // Check if parent is archived - if so, disconnect from parent
    let parentDocumentId = document.parentDocumentId;

    if (document.parentDocumentId) {
      const parent = await db.document.findUnique({
        where: { id: document.parentDocumentId },
      });

      if (parent?.isArchived) {
        parentDocumentId = ""; // Disconnect from archived parent
      }
    }

    // Recursively restore all children
    const restoreRecursively = async (docId: string) => {
      const children = await db.document.findMany({
        where: { parentDocumentId: docId },
        select: { id: true },
      });

      // Restore the current document
      await db.document.update({
        where: { id: docId },
        data: { isArchived: false },
      });

      // Restore all children
      for (const child of children) {
        await restoreRecursively(child.id);
      }
    };

    await restoreRecursively(documentId);

    // Update the parent reference if needed
    if (parentDocumentId !== document.parentDocumentId) {
      document = await db.document.update({
        where: { id: documentId },
        data: { parentDocumentId },
        include: {
          owner: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });
    }

    return {
      success: true,
      data: {
        ...document,
        isArchived: false,
        isOwner: access.data.isOwner,
        role: access.data.role,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[RESTORE_DOCUMENT]", error);
    return {
      success: false,
      error: "Failed to restore document",
      status: 500,
    };
  }
};

/**
 * Permanently removes a document and all its children
 */
export const removeDocument = async ({
  userId,
  documentId,
}: DocumentActionProps): Promise<ServiceResponse<{ id: string }>> => {
  try {
    // First verify the document belongs to this user
    const document = await db.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found or you do not have permission",
        status: 404,
      };
    }

    // For safety, verify document is already archived before permanent deletion
    if (!document.isArchived) {
      return {
        success: false,
        error: "Cannot delete a document that is not in the trash",
        status: 400,
      };
    }

    // Remove all child documents
    const deleteRecursively = async (documentId: string) => {
      // Find all direct child documents
      const children = await db.document.findMany({
        where: {
          userId,
          parentDocumentId: documentId || "",
        },
      });

      for (const child of children) {
        // Recursively remove it's children
        await deleteRecursively(child.id);

        // Remove the Collaborators
        await db.collaborator.deleteMany({
          where: {
            documentId: child.id,
          },
        });

        // Remove the child
        await db.document.delete({
          where: {
            id: child.id,
          },
        });
      }
    };

    await deleteRecursively(documentId);

    // Remove the collaborators (cascading delete will handle child documents & collaborators) but we are using mongodb so we want to do it manually via recursion as we do above
    await db.collaborator.deleteMany({
      where: {
        documentId: documentId,
      },
    });

    // Delete the document (cascading delete will handle child documents & collaborators) but we are using mongodb so we want to do it manually via recursion as we do above
    const deletedDocument = await db.document.delete({
      where: {
        id: documentId,
      },
    });

    return {
      success: true,
      data: {
        id: deletedDocument.id,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[REMOVE_DOCUMENT]: ", error);
    return {
      success: false,
      error: "Failed to delete document",
      status: 500,
    };
  }
};

/**
 * Updates a document with provided changes
 */
export const updateDocument = async ({
  userId,
  documentId,
  content,
  title,
  coverImage,
  icon,
  isPublished,
}: UpdateDocumentProps): Promise<ServiceResponse<DocumentWithMeta>> => {
  try {
    // Check access rights
    const access = await getDirectDocumentAccess(documentId, userId);

    if (!access.success || !access.data?.hasAccess) {
      return {
        success: false,
        error: "Document not found or no access",
        status: 404,
      };
    }

    // Check if user has appropriate permissions
    const isOwner = access.data.isOwner;
    const role = access.data.role;

    // Non-owners with non-EDITOR roles can't edit
    if (!isOwner && role !== "EDITOR") {
      return {
        success: false,
        error: "You don't have permission to edit this document",
        status: 403,
      };
    }

    // Non-owners can only update content and title
    if (
      !isOwner &&
      (coverImage !== undefined ||
        icon !== undefined ||
        isPublished !== undefined)
    ) {
      return {
        success: false,
        error: "Collaborators can only update document content and title",
        status: 403,
      };
    }

    // Build update object
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (title !== undefined) updateData.title = title;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (icon !== undefined) updateData.icon = icon;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Update the document
    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: updateData,
      include: {
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        ...updatedDocument,
        isOwner,
        role,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[UPDATE_DOCUMENT]: ", error);
    return {
      success: false,
      error: "Failed to update document",
      status: 500,
    };
  }
};

/**
 * Gets a document by ID if the user has access to it
 */
export const getDocumentById = async ({
  userId,
  documentId,
}: DocumentActionProps): Promise<ServiceResponse<DocumentWithMeta>> => {
  try {
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        collaborators: {
          where: {
            userId,
            isVerified: { not: null },
          },
        },
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found",
        status: 404,
      };
    }

    // Direct owner
    if (document.userId === userId) {
      const { collaborators, ...docWithoutCollaborators } = document;

      return {
        success: true,
        data: {
          ...docWithoutCollaborators,
          isOwner: true,
          role: "OWNER",
        },
        status: 200,
      };
    }

    // Direct collaborator
    if (document.collaborators.length > 0) {
      const { collaborators, ...docWithoutCollaborators } = document;

      return {
        success: true,
        data: {
          ...docWithoutCollaborators,
          isOwner: false,
          role: collaborators[0].role,
        },
        status: 200,
      };
    }

    // Published document (public access)
    if (document.isPublished) {
      const { collaborators, ...docWithoutCollaborators } = document;

      return {
        success: true,
        data: {
          ...docWithoutCollaborators,
          isOwner: false,
          role: null,
        },
        status: 200,
      };
    }

    return {
      success: false,
      error: "You don't have access to this document",
      status: 403,
    };
  } catch (error) {
    console.error("[GET_DOCUMENT_BY_ID]: ", error);
    return {
      success: false,
      error: "Failed to retrieve document",
      status: 500,
    };
  }
};
