import { db } from "@/lib/db";

export const getCollaboratorVerificationTokenByToken = async (
  token: string
) => {
  try {
    const verificationToken = await db.collaboratorVerificationToken.findUnique(
      {
        where: { token },
      }
    );

    return verificationToken;
  } catch {
    return null;
  }
};

export const getCollaboratorVerificationTokenByEmail = async (
  email: string,
  documentId: string
) => {
  try {
    const verificationToken = await db.collaboratorVerificationToken.findFirst({
      where: { email, documentId },
    });

    return verificationToken;
  } catch {
    return null;
  }
};
