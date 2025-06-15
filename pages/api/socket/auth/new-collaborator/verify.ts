import { db } from "@/lib/db";
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import {
  addCollaborator,
  verifyCollaborator,
} from "@/services/collaborator-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  try {
    // Validate request and authentication
    const token = req.query.token as string;
    // const user = await currentUser(req);
    if (!token) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Verify token validity
    const tokenEntry = await db.collaboratorVerificationToken.findUnique({
      where: { token },
    });
    if (!tokenEntry || tokenEntry.expires < new Date()) {
      return res.status(400).json({ error: "Token expired or invalid" });
    }

    // Fetch document owner
    const documentOwnerId = await db.document.findUnique({
      where: {
        id: tokenEntry.documentId,
      },
      select: {
        userId: true,
      },
    });

    // Find associated user
    const collaboratorUser = await db.user.findUnique({
      where: {
        email: tokenEntry.email,
      },
    });
    if (!collaboratorUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!collaboratorUser.emailVerified) {
      return res.status(404).json({ error: "Not verified" });
    }

    // Check if already a collaborator
    const existing = await db.collaborator.findFirst({
      where: {
        userId: collaboratorUser.id,
        documentId: tokenEntry.documentId,
      },
    });
    if (!existing) {
      // Create the collaboration (as token is valid)
      await addCollaborator({
        documentId: tokenEntry.documentId,
        userId: documentOwnerId?.userId as string,
        collaboratorEmail: tokenEntry.email,
      });
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
    const room = `room:document:${tokenEntry.documentId}`;
    res?.socket?.server?.io
      ?.to(room)
      .emit("collaborator:settings:verified", collaborator);

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
