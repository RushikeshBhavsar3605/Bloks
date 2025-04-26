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
    const user = await currentUser(req);

    if (!user) {
      return res.status(401).json({ error: "Not authenticated!" });
    }

    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document || document.userId !== user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const invitedUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!invitedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (document.userId === invitedUser.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const token = await generateCollaboratorVerificationToken(
      email,
      documentId
    );

    await sendCollaboratorVerificationEmail(token.email, token.token);

    const collaborator = await addCollaborator({
      documentId,
      userId: user.id,
      collaboratorEmail: email,
    });

    res?.socket?.server?.io?.emit(
      "document:collaborator:settings",
      collaborator.data
    );

    return res.status(200).json(collaborator.data);
  } catch (error) {
    console.error("[CREATE_DOCUMENT]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
