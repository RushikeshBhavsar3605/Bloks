import { db } from "@/lib/db";
import { CollaboratorRole } from "@prisma/client";

interface AddCollaboratorProps {
  documentId: string;
  userId: string;
  collaboratorEmail: string;
  role?: CollaboratorRole;
}

interface UpdateCollaboratorRoleProps {
  documentId: string;
  userId: string;
  collaboratorId: string;
  newRole: CollaboratorRole;
}

interface RemoveCollaboratorProps {
  documentId: string;
  userId: string;
  collaboratorId: string;
}

type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};

// Add collaborator to document
export const addCollaborator = async ({
  documentId,
  userId,
  collaboratorEmail,
  role = CollaboratorRole.VIEWER,
}: AddCollaboratorProps): Promise<ServiceResponse<any>> => {
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
        success: false,
        error: "User not found",
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

    return {
      success: true,
      data: newCollaborator,
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_ADDING_COLLABORATOR]: ", error);
    return {
      success: false,
      error: "An unexpected error occured",
      status: 500,
    };
  }
};

export const updateCollaboratorRole = async ({
  documentId,
  userId,
  collaboratorId,
  newRole,
}: UpdateCollaboratorRoleProps): Promise<ServiceResponse<any>> => {
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

    return {
      success: true,
      data: updatedCollaborator,
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_UPDATING_COLLABORATOR_ROLE]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      status: 500,
    };
  }
};

// Remove collaborator from document
export const removeCollaborator = async ({
  documentId,
  userId,
  collaboratorId,
}: RemoveCollaboratorProps): Promise<ServiceResponse<any>> => {
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
    await db.collaborator.delete({
      where: {
        id: collaboratorId,
      },
    });

    return {
      success: true,
      status: 204,
    };
  } catch (error) {
    console.error("[ERROR_REMOVING_COLLABORATOR]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      status: 500,
    };
  }
};

export const getDocumentCollaborators = async (
  documentId: string,
  userId: string
): Promise<ServiceResponse<any>> => {
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
      data: collaborators,
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_GETTING_DOCUMENT_COLLABORATORS]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      status: 500,
    };
  }
};

export const getUserAccessibleDocuments = async (
  userId: string
): Promise<ServiceResponse<any>> => {
  try {
    const ownedDocuments = await db.document.findMany({
      where: {
        userId,
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const collaborations = await db.collaborator.findMany({
      where: {
        userId,
        isVerified: {
          not: null,
        },
        document: {
          isArchived: false,
        },
      },
      include: {
        document: true,
      },
    });

    const collaboratedDocuments = collaborations
      .map((collab) => ({
        ...collab.document,
        role: collab.role,
        isCollaborator: true,
      }))
      .filter((doc) => doc);

    const ownedDocsWithMeta = ownedDocuments.map((doc) => ({
      ...doc,
      isOwner: true,
      role: null,
    }));

    return {
      success: true,
      data: {
        owned: ownedDocsWithMeta,
        collaborated: collaboratedDocuments,
        all: [...ownedDocsWithMeta, ...collaboratedDocuments],
      },
      status: 200,
    };
  } catch (error) {
    console.error("[ERROR_GETTING_USER_ACCESSIBLE_DOCUMENTS]: ", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      status: 500,
    };
  }
};
