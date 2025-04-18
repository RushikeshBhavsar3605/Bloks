import { currentUser } from "@/lib/auth-server";
import {
  removeCollaborator,
  updateCollaboratorRole,
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

    const { documentId, collaboratorId } = req.query as {
      documentId: string;
      collaboratorId: string;
    };

    // PATCH - Update collaborator role
    if (req.method === "PATCH") {
      const { role } = req.body;

      const response = await updateCollaboratorRole({
        documentId,
        userId: user.id,
        collaboratorId,
        newRole: role as CollaboratorRole,
      });

      if (!response.success) {
        return res
          .status(response.status || 400)
          .json({ error: response.error });
      }

      return res.status(response.status || 200).json(response.data);
    }

    // DELETE - Remove a collaborator
    if (req.method === "DELETE") {
      await removeCollaborator({
        documentId,
        userId: user.id,
        collaboratorId,
      });

      return res.status(200).json({ success: "Successfully Removed!" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.log("[ERROR_UPDATE_REMOVE_COLLABORATORS]: ", error);
    return res.status(400).json({ error: error.message });
  }
}
