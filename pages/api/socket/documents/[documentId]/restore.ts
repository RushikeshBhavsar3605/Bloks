import { currentUser } from "@/lib/auth-server";
import { restoreDocument } from "@/services/document-service";
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

  // PATCH - Restore a document from trash
  if (req.method === "PATCH") {
    const response = await restoreDocument({ userId: user.id, documentId });

    if (!response.success) {
      return res.status(response.status || 400).json({ error: response.error });
    }

    if (!response.data) {
      return res
        .status(500)
        .json({ error: "Restore operation returned no data" });
    }

    const { restoredDocument, restoredIds } = response.data;
    const parentDocumentId = restoredDocument.parentDocumentId;

    if (parentDocumentId) {
      const parentRoom = `room:document:${parentDocumentId}`;
      const restoreEvent = `document:restore:${parentDocumentId}`;

      res?.socket?.server?.io?.to(parentRoom).emit(restoreEvent, response.data);
    } else {
      res?.socket?.server?.io
        ?.to(`user:${user.id}`)
        .emit("document:restore:root", response.data);
    }

    return res.status(response.status || 200).json(response.data);
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
