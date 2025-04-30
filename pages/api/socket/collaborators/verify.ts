import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth-server";
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { verifyCollaborator } from "@/services/collaborator-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  console.log("RUN");
  const token = req.query.token as string;
  const user = await currentUser(req);

  if (!token || !user) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const tokenEntry = await db.collaboratorVerificationToken.findUnique({
    where: { token },
  });

  if (!tokenEntry || tokenEntry.expires < new Date()) {
    return res.status(400).json({ error: "Token expired or invalid" });
  }

  const collaboratorUser = await db.user.findUnique({
    where: {
      email: tokenEntry.email,
    },
  });

  // Check if already a collaborator
  const existing = await db.collaborator.findFirst({
    where: {
      userId: collaboratorUser?.id,
      documentId: tokenEntry.documentId,
    },
  });

  console.log("Existing: ", existing);

  if (!existing) {
    return res.status(404).json({ error: "Collaborator Relation Not Found!" });
  }

  const collaborator = await verifyCollaborator({
    documentId: tokenEntry.documentId,
    userId: collaboratorUser?.id as string,
  });

  await db.collaboratorVerificationToken.delete({
    where: {
      id: tokenEntry.id,
    },
  });

  res?.socket?.server?.io?.emit("document:collaborator:settings", collaborator);

  return res.redirect(`/documents/${tokenEntry.documentId}`);
}
