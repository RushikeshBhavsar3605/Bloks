import { db } from "@/lib/db";

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

interface FetchAllDocumentsProps extends DocumentActionProps {}
interface ArchiveDocumentProps extends DocumentActionProps {}
interface RestoreDocumentProps extends DocumentActionProps {}
interface RemoveDocumentProps extends DocumentActionProps {}
interface GetDocumentByIdProps extends DocumentActionProps {}

interface CreateDocumentProps {
  userId: string;
  title: string;
  parentDocumentId?: string;
}

interface UpdateDocumentProps {
  userId: string;
  documentId: string;
  content?: string;
  title?: string;
  coverImage?: string;
  icon?: string;
  isPublished?: boolean;
}

export const createDocument = async ({
  userId,
  title,
  parentDocumentId,
}: CreateDocumentProps): Promise<ServiceResponse<any>> => {
  try {
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

    return {
      success: true,
      data: document,
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_CREATE_DOCUMENT]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the document",
      status: 500,
    };
  }
};

// Modified function to fetch documents with collaborator access check
export const fetchAllDocuments = async ({
  userId,
  documentId,
}: FetchAllDocumentsProps): Promise<ServiceResponse<any>> => {
  try {
    // Fetch all Documents with given parentId
    const documents = await db.document.findMany({
      where: {
        parentDocumentId: documentId,
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter out only accessible Documents
    const accessibleDocuments = [];

    for (const doc of documents) {
      const accessResult = await checkDocumentAccess(doc.id, userId);

      if (accessResult.success && accessResult.data?.hasAccess) {
        accessibleDocuments.push({
          ...doc,
          role:
            accessResult.data.role ||
            (accessResult.data.isOwner ? "OWNER" : null), // 👈 Add role here
        });
      }
    }

    return {
      success: true,
      data: accessibleDocuments,
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_FETCHING_DOCUMENTS]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching documents",
      status: 500,
    };
  }
};

// Modified function to fetch documents with collaborator access for initial sidebar rendering
export const getDocuments = async (
  userId: string
): Promise<ServiceResponse<any>> => {
  try {
    // Fetch documents owned by the user
    const ownedDocuments = await db.document.findMany({
      where: {
        userId,
        isArchived: false,
        parentDocument: null,
      },
      include: {
        childDocuments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        collaborators: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch documents where user is a collaborator
    const sharedDocuments = await db.document.findMany({
      where: {
        collaborators: {
          some: {
            userId,
            isVerified: { not: null }, // Only include verified collaborations
          },
        },
        isArchived: false,
        parentDocument: null,
      },
      include: {
        childDocuments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        collaborators: true,
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

    const finalDocuments = sharedDocuments.map((doc) => {
      const myCollaborator = doc.collaborators.find((c) => c.userId === userId);
      return {
        ...doc,
        role: myCollaborator?.role ?? null,
      };
    });

    return {
      success: true,
      data: { ownedDocuments, sharedDocuments: finalDocuments },
      status: 200,
    };
  } catch (error) {
    console.error("[GET_DOCUMENTS]", error);
    return {
      success: false,
      data: { ownedDocuments: [], sharedDocuments: [] },
      error: "An unexpected error occurred while fetching documents",
      status: 500,
    };
  }
};

// Modified function to fetch all user's documents including archived ones
export const getAllDocuments = async (
  userId: string
): Promise<ServiceResponse<any>> => {
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
        collaborators: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: documents,
      status: 200,
    };
  } catch (error) {
    console.error("[GET_ALL_DOCUMENTS]", error);
    return {
      success: false,
      data: [],
      error: "An unexpected error occurred while fetching all documents",
      status: 500,
    };
  }
};

// Recursive function to check document access rights
export const checkDocumentAccess = async (
  documentId: string,
  userId: string
): Promise<ServiceResponse<any>> => {
  try {
    // Check if user is the owner
    const document = await db.document.findUnique({
      where: { id: documentId },
      select: { userId: true, parentDocument: true },
    });

    if (!document) {
      return {
        success: false,
        data: {
          hasAccess: false,
          role: null,
        },
        error: "Document not found",
        status: 404,
      };
    }

    // Case 1: User is the owner
    if (document.userId === userId) {
      return {
        success: true,
        data: {
          hasAccess: true,
          isOwner: true,
          role: null,
        },
        status: 200,
      };
    }

    // Case 2: Check if user is a direct collaborator
    const collaboration = await db.collaborator.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
    });

    if (collaboration?.isVerified) {
      return {
        success: true,
        data: {
          hasAccess: true,
          isOwner: false,
          role: collaboration.role,
        },
        status: 200,
      };
    }

    // Case 3: Check if parent document gives access rights
    if (document?.parentDocument) {
      return checkDocumentAccess(document.parentDocument.id, userId);
    }

    return {
      success: false,
      data: {
        hasAccess: false,
        isOwner: false,
        role: null,
      },
      error: "You do not have access to this document",
      status: 403,
    };
  } catch (error) {
    console.error("[CHECK_DOCUMENT_ACCESS]", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      status: 500,
    };
  }
};

// Modified function to fetch archived documents with collaboration support
export const getArchivedDocuments = async (
  userId: string
): Promise<ServiceResponse<any>> => {
  try {
    // Get archived documents owned by the user
    let ownedArchived = await db.document.findMany({
      where: {
        userId,
        isArchived: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add isOwner and role for owned documents
    ownedArchived = ownedArchived.map((doc) => ({
      ...doc,
      isOwner: true,
      role: null,
    }));

    // Get archived documents where user is a collaborator
    let sharedArchived = await db.document.findMany({
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
        collaborators: true,
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Add isOwner and role for shared documents
    sharedArchived = sharedArchived
      .map((doc) => {
        const userCollab = doc.collaborators.find(
          (collab) => collab.userId === userId && collab.isVerified
        );

        if (!userCollab) {
          return null;
        }

        return {
          ...doc,
          isOwner: false,
          role: userCollab.role,
        };
      })
      .filter((doc) => doc !== null);

    return {
      success: true,
      data: { ownedArchived, sharedArchived },
      status: 200,
    };
  } catch (error) {
    console.error("[GET_ARCHIVED_DOCUMENTS]", error);
    return {
      success: false,
      data: { ownedArchived: [], sharedArchived: [] },
      error: "An unexpected error occurred while fetching archived documents",
      status: 500,
    };
  }
};

// Demolish Afterwards
export const fetchAllTrashDocuments = async (
  userId: string
): Promise<ServiceResponse<any>> => {
  try {
    const documents = await db.document.findMany({
      where: {
        userId,
        isArchived: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: documents,
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_FETCHING_TRASH_DOCUMENTS]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching trash",
      status: 500,
    };
  }
};

// Recursive archiving with collaboration handling
export const archiveDocument = async ({
  userId,
  documentId,
}: ArchiveDocumentProps): Promise<ServiceResponse<any>> => {
  try {
    // First check access rights
    const accessCheck = await checkDocumentAccess(documentId, userId);

    if (
      !accessCheck.data.hasAccess ||
      !(accessCheck.data.isOwner || accessCheck.data.role === "EDITOR")
    ) {
      return {
        success: false,
        error: "You don't have permission to archive this document",
        status: 403,
      };
    }

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

    // Archive the document
    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: { isArchived: true },
    });

    // Recursively archive all child documents
    if (document.childDocuments.length > 0) {
      for (const child of document.childDocuments) {
        await archiveDocument({ documentId: child.id, userId });
      }
    }

    return {
      success: true,
      data: updatedDocument,
      status: 200,
    };
  } catch (error) {
    console.error("[ARCHIVE_DOCUMENT]", error);
    return {
      success: false,
      error: "An unexpected error occurred while archiving document",
      status: 500,
    };
  }
};

// Demolish Afterwards
/*
export const archiveDocument = async ({
  userId,
  documentId,
}: ArchiveDocumentProps): Promise<ServiceResponse<any>> => {
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

    // Recursively archive all child documents
    const recursiveArchiveChildren = async (parentId: string) => {
      // Find all child documents
      const children = await db.document.findMany({
        where: {
          userId,
          parentDocumentId: parentId || "",
          isArchived: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      for (const child of children) {
        // Recursively archive its children
        await recursiveArchiveChildren(child.id);

        // Archive the child
        await db.document.update({
          where: {
            id: child.id,
          },
          data: {
            isArchived: true,
          },
        });
      }
    };

    await recursiveArchiveChildren(documentId);

    // Archive this document
    const archivedDocument = await db.document.update({
      where: {
        id: documentId,
      },
      data: {
        isArchived: true,
      },
    });

    return {
      success: true,
      data: archivedDocument,
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_ARCHIVE_DOCUMENT]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred while archiving the document",
      status: 500,
    };
  }
};
*/

// Recursive restoration with collaboration handling
export const restoreDocument = async ({
  userId,
  documentId,
}: RestoreDocumentProps): Promise<ServiceResponse<any>> => {
  try {
    // First check access rights (OWNER or EDITOR)
    const accessCheck = await checkDocumentAccess(documentId, userId);
    if (
      !accessCheck.data.hasAccess ||
      !(accessCheck.data.role === "OWNER" || accessCheck.data.role === "EDITOR")
    ) {
      return {
        success: false,
        error: "You don't have permission to restore this document",
        status: 403,
      };
    }

    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found or you do not have permission",
        status: 404,
      };
    }

    // Restore all child documents
    const recursiveRestoreChildren = async (parentId: string) => {
      // Find all direct child documents
      const children = await db.document.findMany({
        where: {
          parentDocumentId: parentId || "",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      for (const child of children) {
        // Recursively restore its children
        await recursiveRestoreChildren(child.id);

        // Restore the child
        await db.document.update({
          where: {
            id: child.id,
          },
          data: {
            isArchived: false,
          },
        });
      }
    };

    // Check if parent is archived - if so, we need to restore the document without a parent
    const options: Partial<{ isArchived: boolean; parentDocumentId: string }> =
      {
        isArchived: false,
        parentDocumentId: document.parentDocumentId || "",
      };

    if (document.parentDocumentId && document.parentDocumentId != "") {
      const parent = await db.document.findUnique({
        where: {
          id: document.parentDocumentId,
        },
      });

      if (parent?.isArchived) {
        options.parentDocumentId = "";
      }
    }

    await recursiveRestoreChildren(documentId);

    // Restore this document
    const restoredDocument = await db.document.update({
      where: {
        id: documentId,
      },
      data: options,
    });

    return {
      success: true,
      data: restoredDocument,
      status: 200,
    };
  } catch (error) {
    console.error("Error restoring document:", error);
    return {
      success: false,
      error: "An unexpected error occurred while restoring the document",
      status: 500,
    };
  }
};

// Recursive deletion with collaboration handling
export const removeDocument = async ({
  userId,
  documentId,
}: RemoveDocumentProps): Promise<ServiceResponse<any>> => {
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
    const recursiveRemoveChildren = async (documentId: string) => {
      // Find all direct child documents
      const children = await db.document.findMany({
        where: {
          userId,
          parentDocumentId: documentId || "",
        },
      });

      for (const child of children) {
        // Recursively remove it's children
        await recursiveRemoveChildren(child.id);

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

    await recursiveRemoveChildren(documentId);

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
      data: deletedDocument,
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_REMOVE_DOCUMENT]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred while removing the document",
      status: 500,
    };
  }
};

export const updateDocument = async ({
  userId,
  documentId,
  content,
  title,
  coverImage,
  icon,
  isPublished,
}: UpdateDocumentProps): Promise<ServiceResponse<any>> => {
  try {
    // First check document ownership or collaborator with edit access
    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found",
        status: 404,
      };
    }

    // Use checkDocumentAccess to verify permissions
    const accessCheck = await checkDocumentAccess(documentId, userId);

    if (!accessCheck.success || !accessCheck.data.hasAccess) {
      return {
        success: false,
        error: accessCheck.error || "You do not have access to this document",
        status: accessCheck.status || 403,
      };
    }

    // Check if user has permission to make the requested changes
    const isOwner = accessCheck.data.isOwner;
    const role = accessCheck.data.role;

    if (!isOwner) {
      // Check if user is a collaborator with EDITOR role
      if (!role || role !== "EDITOR") {
        return {
          success: false,
          error: "You do not have permission to edit this document",
          status: 403,
        };
      }

      // If collaborator, only allow content updates, not metadata
      if (
        coverImage !== undefined ||
        icon !== undefined ||
        isPublished !== undefined
      ) {
        return {
          success: false,
          error: "Collaborators can only update document content",
          status: 403,
        };
      }
    }

    // Build update data object based on provided parameters
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (title !== undefined) updateData.title = title;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (icon !== undefined) updateData.icon = icon;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Update the document
    const updatedDocument = await db.document.update({
      where: {
        id: documentId,
      },
      data: updateData,
    });

    return {
      success: true,
      data: {
        ...updatedDocument,
        isOwner: isOwner,
        role: role,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_UPDATE_DOCUMENT]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating the document",
      status: 500,
    };
  }
};

export const getDocumentById = async ({
  userId,
  documentId,
}: GetDocumentByIdProps): Promise<ServiceResponse<any>> => {
  try {
    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found",
        status: 404,
      };
    }

    // First use checkDocumentAccess to verify access rights and get role information
    const accessCheck = await checkDocumentAccess(documentId, userId);

    // If user has valid access through ownership or collaboration
    if (accessCheck.success && accessCheck.data.hasAccess) {
      return {
        success: true,
        data: {
          ...document,
          isOwner: accessCheck.data.isOwner,
          role: accessCheck.data.role,
        },
        status: 200,
      };
    }

    // Check if document is published (public)
    if (document.isPublished) {
      return {
        success: true,
        data: {
          ...document,
          isOwner: document.userId === userId,
          role: null,
        },
        status: 200,
      };
    }

    return {
      success: false,
      error: accessCheck.error || "You do not have access to this document",
      status: accessCheck.status || 403,
    };
  } catch (error) {
    console.error("[ERROR_FETCHING_DOCUMENT]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching the document",
      status: 500,
    };
  }
};
