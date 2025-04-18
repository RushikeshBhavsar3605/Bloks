import { currentUser } from "@/lib/auth-server";
import { getDocumentById, updateDocument } from "@/services/document-service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  const user = await currentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { documentId } = req.query as { documentId: string };

  // GET - Fetch a single document
  if (req.method === "GET") {
    const response = await getDocumentById({ userId: user.id, documentId });

    if (!response.success) {
      return res.status(response.status || 400).json({ error: response.error });
    }

    return res.status(response.status || 200).json(response.data);
  }

  // PATCH - Update document content or metadata
  if (req.method === "PATCH") {
    const { content, title, coverImage, icon, isPublished } = req.body;

    const response = await updateDocument({
      userId: user.id,
      documentId,
      content,
      title,
      coverImage,
      icon,
      isPublished,
    });

    if (!response.success) {
      return res.status(response.status || 400).json({ error: response.error });
    }

    res?.socket?.server?.io?.emit(
      `document:update:${documentId}`,
      response.data
    );

    return res.status(response.status || 200).json(response.data);
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
