import { currentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { generateCollaboratorVerificationToken } from "@/lib/tokens";
import { sendCollaboratorVerificationEmail } from "@/lib/mail";
import { addCollaborator } from "@/services/collaborator-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, documentId } = req.body;

    // Get current authenticated user
    const user = await currentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated!" });
    }

    // Validate document ownership
    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
    });
    if (!document || document.userId !== user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    // Check if invited user exists
    const invitedUser = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (invitedUser && document.userId === invitedUser.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    // Add collaborator (record can be added even if user doesn't exist yet)
    const collaborator = await addCollaborator({
      documentId,
      userId: user.id,
      collaboratorEmail: email,
    });

    if (!collaborator.success) {
      return res.status(400).json({ error: collaborator.error });
    }

    // Generate verification token and send invite email
    const token = await generateCollaboratorVerificationToken(
      email,
      documentId
    );
    await sendCollaboratorVerificationEmail(token.email, token.token);

    // Emit real-time update via Socket.io
    const room = `room:document:${documentId}`;
    res?.socket?.server?.io?.to(room).emit("collaborator:settings:invite", {
      invited: collaborator.success,
      userExist: collaborator.data ? true : false,
      newCollaborator: {
        userName: collaborator.data ? collaborator.data.user.name : undefined,
        email: email,
        documentId: document.id,
        documentTitle: document.title,
        addedBy: { name: user.name, id: user.id },
      },
    });

    // Return response
    return res
      .status(200)
      .json({ invited: true, newCollaborator: collaborator.data ?? null });
  } catch (error) {
    console.error("[CREATE_DOCUMENT]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
