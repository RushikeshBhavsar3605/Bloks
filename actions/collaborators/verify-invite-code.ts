"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  addCollaborator,
  verifyCollaborator,
} from "@/services/collaborator-service";

export const verifyInviteCode = async (
  token: string,
): Promise<{
  error?: string;
  redirect?: string;
}> => {
  const user = await currentUser();
  if (!token || !user?.id) {
    return { error: "You haven't registered yet!" };
  }

  const tokenModel = await db.documentInviteToken.findUnique({
    where: {
      token,
    },
  });

  if (!tokenModel) return { error: "Invalid Token" };

  const existingCollaborator = await db.collaborator.findFirst({
    where: {
      userId: user.id,
      documentId: tokenModel.documentId,
    },
  });

  const document = await db.document.findUnique({
    where: {
      id: tokenModel.documentId,
    },
  });

  if (!document) {
    return { error: "Document Not Exist" };
  }

  if (document?.userId === user.id) {
    return { error: "Already Owner" };
  }

  if (existingCollaborator) return { error: "Already Collaborator" };

  await addCollaborator({
    documentId: tokenModel.documentId,
    userId: document?.userId as string,
    collaboratorEmail: user.email as string,
  });

  await verifyCollaborator({
    documentId: tokenModel.documentId,
    userId: user.id,
  });

  return {
    redirect: `/documents/${tokenModel.documentId}`,
  };
};
