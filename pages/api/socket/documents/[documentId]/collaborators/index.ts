import { currentUser } from "@/lib/auth-server";
import {
  addCollaborator,
  getDocumentCollaborators,
} from "@/services/collaborator-service";
import { CollaboratorRole } from "@prisma/client";
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

    // GET - Fetch all collaborators for a document
    if (req.method === "GET") {
      const response = await getDocumentCollaborators(documentId, user.id);

      if (!response.success) {
        return res
          .status(response.status || 400)
          .json({ error: response.error });
      }

      return res.status(response.status || 200).json(response.data);
    }

    // POST - Add a new collaborator
    if (req.method === "POST") {
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const response = await addCollaborator({
        documentId,
        userId: user.id,
        collaboratorEmail: email,
        role: role as CollaboratorRole,
      });

      if (!response.success) {
        return res
          .status(response.status || 400)
          .json({ error: response.error });
      }

      return res.status(response.status || 200).json(response.data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.log("[ERROR_GET_ADD_COLLABORATOR]: ", error);
    return res.status(400).json({ error: error.message });
  }
}
