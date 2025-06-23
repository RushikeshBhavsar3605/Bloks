import { currentUser } from "@/lib/auth-server";
import {
  removeCollaborator,
  updateCollaboratorRole,
} from "@/services/collaborator-service";
import { CollaboratorRole } from "@prisma/client";
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
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

      const updatedCollaborator = await updateCollaboratorRole({
        documentId,
        userId: user.id,
        collaboratorId,
        newRole: role as CollaboratorRole,
      });

      if (!updatedCollaborator.success) {
        return res
          .status(updatedCollaborator.status || 400)
          .json({ error: updatedCollaborator.error });
      }

      const room = `room:document:${documentId}`;
      res.socket.server.io.to(room).emit("collaborator:settings:role", {
        documentId: documentId,
        updatedBy: { id: user.id, name: user.name },
        updatedUser: {
          id: updatedCollaborator.data?.user.id,
          name: updatedCollaborator.data?.user.name,
        },
        newRole: updatedCollaborator.data?.role,
        prevRole: updatedCollaborator.data?.prevRole,
      });

      return res
        .status(updatedCollaborator.status || 200)
        .json(updatedCollaborator.data);
    }

    // DELETE - Remove a collaborator
    if (req.method === "DELETE") {
      const deletedCollaborator = await removeCollaborator({
        documentId,
        userId: user.id,
        collaboratorId,
      });

      if (!deletedCollaborator.success) {
        return res
          .status(deletedCollaborator.status || 400)
          .json({ error: deletedCollaborator.error });
      }

      const room = `room:document:${documentId}`;
      res.socket.server.io.to(room).emit("collaborator:settings:remove", {
        addedBy: deletedCollaborator.data?.addedBy,
        documentId: deletedCollaborator.data?.documentId,
        documentTitle: deletedCollaborator.data?.documentTitle,
        removedUser: deletedCollaborator.data?.removedUser,
      });

      return res.status(200).json({ success: "Successfully Removed!" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.log("[ERROR_UPDATE_REMOVE_COLLABORATORS]: ", error);
    return res.status(400).json({ error: error.message });
  }
}
