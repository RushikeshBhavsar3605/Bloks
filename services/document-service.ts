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

export const fetchAllDocuments = async ({
  userId,
  documentId,
}: FetchAllDocumentsProps): Promise<ServiceResponse<any>> => {
  try {
    const documents = await db.document.findMany({
      where: {
        userId,
        parentDocumentId: documentId,
        isArchived: false,
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
    console.error("[ERROR_FETCHING_DOCUMENTS]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching documents",
      status: 500,
    };
  }
};

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

export const restoreDocument = async ({
  userId,
  documentId,
}: RestoreDocumentProps): Promise<ServiceResponse<any>> => {
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

    // Restore all child documents
    const recursiveRestoreChildren = async (parentId: string) => {
      // Find all direct child documents
      const children = await db.document.findMany({
        where: {
          userId,
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
          userId,
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

// TODO: Adding manual collaborator remove on document remove
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

        // Remove the child
        await db.document.delete({
          where: {
            id: child.id,
          },
        });
      }
    };

    await recursiveRemoveChildren(documentId);

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

    // If user is owner, allow all updates
    const isOwner = document.userId === userId;

    if (!isOwner) {
      // Check if user is a collaborator with EDITOR role
      const collaborator = await db.collaborator.findUnique({
        where: {
          userId_documentId: {
            userId,
            documentId,
          },
        },
      });

      if (!collaborator || collaborator.role !== "EDITOR") {
        return {
          success: false,
          error: "You do not have permission to edit this document",
          status: 403,
        };
      }

      // If collaborator, only allow content updates, not metadata
      if (title || coverImage || icon || isPublished !== undefined) {
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
      data: updatedDocument,
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

    // Check if document is published (public)
    if (document.isPublished) {
      return {
        success: true,
        data: document,
        status: 200,
      };
    }

    // Check if user is owner
    if (document.userId === userId) {
      return {
        success: true,
        data: document,
        status: 200,
      };
    }

    // Check if user is a collaborator
    const collaborator = await db.collaborator.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
    });

    if (!collaborator) {
      return {
        success: false,
        error: "You do not have access to this document",
        status: 403,
      };
    }

    return {
      success: true,
      data: {
        ...document,
        role: collaborator.role,
      },
      status: 200,
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
