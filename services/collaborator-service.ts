import { db } from "@/lib/db";
import { CollaboratorWithMeta } from "@/types/shared";
import { CollaboratorRole } from "@prisma/client";

interface DocumentActionProps {
  userId: string;
  documentId: string;
}

interface AddCollaboratorProps extends DocumentActionProps {
  collaboratorEmail: string;
  role?: CollaboratorRole;
}

interface UpdateCollaboratorRoleProps extends DocumentActionProps {
  collaboratorId: string;
  newRole: CollaboratorRole;
}

interface RemoveCollaboratorProps extends DocumentActionProps {
  collaboratorId: string;
}

type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};

// COLLABORATOR MANAGEMENT

/**
 * Adds a collaborator to a document and all its children
 */
export const addCollaborator = async ({
  documentId,
  userId,
  collaboratorEmail,
  role = CollaboratorRole.VIEWER,
}: AddCollaboratorProps): Promise<ServiceResponse<CollaboratorWithMeta>> => {
  try {
    // Check if current user is the owner
    const document = await db.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found or you do not have permission to modify it",
        status: 403,
      };
    }

    // Find user by email
    const collaboratorUser = await db.user.findUnique({
      where: {
        email: collaboratorEmail,
      },
    });

    if (!collaboratorUser) {
      return {
        success: true,
        error: "User not on platform",
        status: 404,
      };
    }

    // Don't allow adding yourself as collaborator
    if (collaboratorUser.id === userId) {
      return {
        success: false,
        error: "Cannot add document owner as a collaborator",
        status: 400,
      };
    }

    // Check if collaboration already exists
    const existingCollaborator = await db.collaborator.findUnique({
      where: {
        userId_documentId: {
          userId: collaboratorUser.id,
          documentId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (existingCollaborator) {
      return {
        success: false,
        error: "User is already a collaborator on this document",
        status: 400,
      };
    }

    // Create the collaboration (pending verification)
    const newCollaborator = await db.collaborator.create({
      data: {
        userId: collaboratorUser.id,
        documentId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Recursively add collaborator to all child documents
    const addToChildrenRecursively = async (parentId: string) => {
      const children = await db.document.findMany({
        where: { parentDocumentId: parentId },
        select: { id: true },
      });

      for (const child of children) {
        // Check if collaboration already exists
        const existingCollab = await db.collaborator.findUnique({
          where: {
            userId_documentId: {
              userId: collaboratorUser.id,
              documentId: child.id,
            },
          },
        });

        if (!existingCollab) {
          // Create if existingCollab doesn't exist
          await db.collaborator.create({
            data: {
              documentId: child.id,
              userId: collaboratorUser.id,
              role,
            },
          });
        }

        // Process children recursively
        await addToChildrenRecursively(child.id);
      }
    };

    // Start recursive process for all children
    await addToChildrenRecursively(documentId);

    return {
      success: true,
      data: newCollaborator,
      status: 200,
    };
  } catch (error) {
    console.error("[ADD_COLLABORATOR]: ", error);
    return {
      success: false,
      error: "Failed to add collaborator",
      status: 500,
    };
  }
};

/**
 * Updates a collaborator's role on a document and all its children
 */
export const updateCollaboratorRole = async ({
  documentId,
  userId,
  collaboratorId,
  newRole,
}: UpdateCollaboratorRoleProps): Promise<
  ServiceResponse<CollaboratorWithMeta & { prevRole: CollaboratorRole }>
> => {
  try {
    const document = await db.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found or you do not have permission to modify it",
        status: 403,
      };
    }

    const collaborator = await db.collaborator.findUnique({
      where: {
        id: collaboratorId,
        documentId,
      },
    });

    if (!collaborator || !collaborator.isVerified) {
      return {
        success: false,
        error: "Collaborator not found or not verified!",
        status: 404,
      };
    }

    // Update collaborator on the current document
    const updatedCollaborator = await db.collaborator.update({
      where: {
        id: collaboratorId,
      },
      data: {
        role: newRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const collaboratorUser = updatedCollaborator.userId;

    // Recursively update role on all child documents
    const updateChildrenRecursively = async (parentId: string) => {
      const children = await db.document.findMany({
        where: { parentDocumentId: parentId },
        select: { id: true },
      });

      for (const child of children) {
        // Check if collaboration exists
        const existingCollab = await db.collaborator.findUnique({
          where: {
            userId_documentId: {
              userId: collaboratorUser,
              documentId: child.id,
            },
          },
        });

        if (existingCollab) {
          // Update if exists
          await db.collaborator.update({
            where: {
              userId_documentId: {
                userId: collaboratorUser,
                documentId: child.id,
              },
            },
            data: { role: newRole },
          });
        }

        // Process children recursively
        await updateChildrenRecursively(child.id);
      }
    };

    // Start recursive process for all children
    await updateChildrenRecursively(documentId);

    return {
      success: true,
      data: { ...updatedCollaborator, prevRole: collaborator.role },
      status: 200,
    };
  } catch (error) {
    console.error("[UPDATE_COLLABORATOR_ROLE]: ", error);
    return {
      success: false,
      error: "Failed to update collaborator role",
      status: 500,
    };
  }
};

/**
 * Mark collaborator as verified on a document and all its children
 */
export const verifyCollaborator = async ({
  documentId,
  userId,
}: DocumentActionProps): Promise<ServiceResponse<CollaboratorWithMeta>> => {
  try {
    // Find the collaborator to verify
    const collaborator = await db.collaborator.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!collaborator) {
      return {
        success: false,
        error: "Collaborator not found",
        status: 404,
      };
    }

    // Verify the collaborator on the current document
    const verifiedCollaborator = await db.collaborator.update({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
      data: {
        isVerified: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Recursively verify collaboration on all child documents
    const verifyChildrenRecursively = async (parentId: string) => {
      const children = await db.document.findMany({
        where: { parentDocumentId: parentId },
        select: { id: true },
      });

      for (const child of children) {
        // Check if collaboration exists but is not verified
        const existingCollab = await db.collaborator.findUnique({
          where: {
            userId_documentId: {
              userId,
              documentId: child.id,
            },
          },
        });

        if (existingCollab && !existingCollab.isVerified) {
          // Verify if exists and not already verified
          await db.collaborator.update({
            where: {
              userId_documentId: {
                userId,
                documentId: child.id,
              },
            },
            data: { isVerified: new Date() },
          });
        }

        // Process children recursively
        await verifyChildrenRecursively(child.id);
      }
    };

    // Start recursive process for all children
    await verifyChildrenRecursively(documentId);

    return {
      success: true,
      data: verifiedCollaborator,
      status: 200,
    };
  } catch (error) {
    console.error("[VERIFY_COLLABORATOR]: ", error);
    return {
      success: false,
      error: "Failed to verify collaborator",
      status: 500,
    };
  }
};

/**
 * Removes a collaborator from a document and all its children
 */
export const removeCollaborator = async ({
  documentId,
  userId,
  collaboratorId,
}: RemoveCollaboratorProps): Promise<
  ServiceResponse<{
    addedBy: { name: string; id: string };
    documentId: string;
    documentTitle: string;
    removedUser: { name: string; id: string };
  }>
> => {
  try {
    // Check if current user is the owner
    const document = await db.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found or you do not have permission to modify it",
        status: 403,
      };
    }

    // Fetch the collaboration
    const collaborator = await db.collaborator.findUnique({
      where: {
        id: collaboratorId,
        documentId,
      },
    });

    if (!collaborator) {
      return {
        success: false,
        error: "Collaborator not found",
        status: 404,
      };
    }

    // Delete the collaboration
    const deletedCollaborator = await db.collaborator.delete({
      where: {
        id: collaboratorId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Recursively remove from all child documents
    const removeFromChildrenRecursively = async (parentId: string) => {
      const children = await db.document.findMany({
        where: { parentDocumentId: parentId },
        select: { id: true },
      });

      for (const child of children) {
        // Check if collaboration exists
        const existingCollab = await db.collaborator.findUnique({
          where: {
            userId_documentId: {
              userId: collaborator.userId,
              documentId: child.id,
            },
          },
        });

        if (existingCollab) {
          // Delete if exists
          await db.collaborator.delete({
            where: {
              userId_documentId: {
                userId: collaborator.userId,
                documentId: child.id,
              },
            },
          });
        }

        // Process children recursively
        await removeFromChildrenRecursively(child.id);
      }
    };

    // Start recursive process for all children
    await removeFromChildrenRecursively(documentId);

    return {
      success: true,
      data: {
        addedBy: { id: userId, name: document.owner.name as string },
        documentId: document.id,
        documentTitle: document.title,
        removedUser: {
          id: deletedCollaborator.user.id,
          name: deletedCollaborator.user.name as string,
        },
      },
      status: 204,
    };
  } catch (error) {
    console.error("[REMOVE_COLLABORATOR]: ", error);
    return {
      success: false,
      error: "Failed to remove collaborator",
      status: 500,
    };
  }
};

/**
 * Get collaborators from a specified document
 */
export const getDocumentCollaborators = async (
  documentId: string,
  userId: string
): Promise<
  ServiceResponse<{
    collaborators: CollaboratorWithMeta[];
    owner: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>
> => {
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

    const isOwner = document.userId === userId;

    if (!isOwner) {
      const collaborator = await db.collaborator.findUnique({
        where: {
          userId_documentId: {
            userId,
            documentId,
          },
        },
      });

      if (!collaborator || !collaborator.isVerified) {
        return {
          success: false,
          error: "You do not have access to this document",
          status: 403,
        };
      }
    }

    const owner = await db.user.findUnique({
      where: {
        id: document.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!owner) {
      return {
        success: false,
        error: "Document doen't contain owner",
        status: 404,
      };
    }

    const collaborators = await db.collaborator.findMany({
      where: {
        documentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return {
      success: true,
      data: { collaborators, owner },
      status: 200,
    };
  } catch (error) {
    console.error("[GET_DOCUMENT_COLLABORATORS]: ", error);
    return {
      success: false,
      error: "Failed to get document collaborator",
      status: 500,
    };
  }
};
