import { currentUser } from "@/lib/auth-server";
import { checkDocumentAccess } from "@/services/collaborator-service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await currentUser(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { documentId } = req.query as { documentId: string };

    // GET - Check if a user has access to a document
    if (req.method === "GET") {
      const response = await checkDocumentAccess(documentId, user.id);

      if (!response.success) {
        return res
          .status(response.status || 400)
          .json({ error: response.error });
      }

      return res.status(response.status || 200).json(response.data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.log("[ERROR_USER_DOCUMENT_ACCESS]: ", error);
    return res.status(400).json({ error: error.message });
  }
}
