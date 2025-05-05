import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth-server";
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { verifyCollaborator } from "@/services/collaborator-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  try {
    // Validate request and authentication
    const token = req.query.token as string;
    const user = await currentUser(req);
    if (!token || !user) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Verify token validity
    const tokenEntry = await db.collaboratorVerificationToken.findUnique({
      where: { token },
    });
    if (!tokenEntry || tokenEntry.expires < new Date()) {
      return res.status(400).json({ error: "Token expired or invalid" });
    }

    // Find associated user
    const collaboratorUser = await db.user.findUnique({
      where: {
        email: tokenEntry.email,
      },
    });
    if (!collaboratorUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already a collaborator
    const existing = await db.collaborator.findFirst({
      where: {
        userId: collaboratorUser?.id,
        documentId: tokenEntry.documentId,
      },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ error: "Collaborator Relation Not Found!" });
    }

    // Verify collaborator and clean up
    const collaborator = await verifyCollaborator({
      documentId: tokenEntry.documentId,
      userId: collaboratorUser.id,
    });

    await db.collaboratorVerificationToken.delete({
      where: {
        id: tokenEntry.id,
      },
    });

    // Emit real-time update
    res?.socket?.server?.io?.emit(
      "document:collaborator:settings",
      collaborator
    );

    // Return success response
    return res.status(200).json({
      redirect: `/documents/${tokenEntry.documentId}`,
      collaborator,
    });
  } catch (error) {
    console.error("[COLLABORATOR_VERIFICATION]: ", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
