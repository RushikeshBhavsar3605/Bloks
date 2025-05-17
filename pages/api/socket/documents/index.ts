import { currentUser } from "@/lib/auth-server";
import {
  createDocument,
  fetchDocuments,
  getRootDocuments,
} from "@/services/document-service";
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

  // GET - Fetch all documents (non-archived)
  if (req.method === "GET") {
    let response;
    const parentDocumentId =
      (req.query.parentDocumentId as string) || undefined;

    if (!parentDocumentId) {
      response = await getRootDocuments(user.id);
    } else {
      response = await fetchDocuments({
        userId: user.id,
        documentId: parentDocumentId,
      });
    }

    if (!response.success) {
      return res.status(response.status || 400).json({ error: response.error });
    }

    return res.status(response.status || 200).json(response.data);
  }

  // POST - Create a new document
  if (req.method === "POST") {
    const { title, parentDocumentId } = req.body;

    const response = await createDocument({
      userId: user.id,
      title: title || "Untitled",
      parentDocumentId,
    });

    if (!response.success || !response.data) {
      return res.status(response.status || 400).json({ error: response.error });
    }

    const documentId = response.data.id;
    const room = `room:document:${documentId}`;

    // Join creator to the document's room
    res?.socket?.server?.io?.in(user.id).socketsJoin(room);

    if (parentDocumentId) {
      const parentRoom = `room:document:${parentDocumentId}`;
      const createEvent = `document:created:${parentDocumentId}`;

      res?.socket?.server?.io?.to(parentRoom).emit(createEvent, response.data);
    } else {
      res?.socket?.server?.io
        ?.to(`user:${user.id}`)
        .emit("document:created:root", response.data);
    }

    return res.status(response.status || 200).json(response.data);
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
