import { currentUser } from "@/lib/auth-server";
import { archiveDocument } from "@/services/document-service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  const user = await currentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Not authenticated!" });
  }

  const { documentId } = req.query as { documentId: string };

  // PATCH - Archive a document
  if (req.method === "PATCH") {
    const response = await archiveDocument({ userId: user.id, documentId });

    if (!response.success) {
      return res.status(response.status || 400).json({ error: response.error });
    }

    const parentDocumentId = response.data?.parentDocumentId;

    if (parentDocumentId) {
      const parentRoom = `room:document:${parentDocumentId}`;
      const archiveEvent = `document:archived:${parentDocumentId}`;

      res?.socket?.server?.io
        ?.to(parentRoom)
        .emit(archiveEvent, response.data?.id);
    } else {
      res?.socket?.server?.io
        ?.to(`user:${user.id}`)
        .emit("document:archived:root", response.data?.id);
    }

    return res.status(response.status || 200).json(response.data?.id);
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
