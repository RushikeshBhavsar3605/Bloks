"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CollaboratorRole } from "@prisma/client";
import { useEffect } from "react";
import { toast } from "sonner";

export const CollaboratorUpdateToast = () => {
  const { socket } = useSocket();
  const user = useCurrentUser();

  useEffect(() => {
    if (!socket) return;

    const handleCollaboratorRoleChange = (data: {
      documentId: string;
      updatedBy: {
        id: string;
        name: string;
      };
      updatedUser: {
        id: string;
        name: string;
      };
      newRole: CollaboratorRole;
      prevRole: CollaboratorRole;
    }) => {
      const { updatedBy, updatedUser, newRole, prevRole } = data;
      if (updatedBy.id === user?.id) return;

      const formatRole = (role: string) =>
        role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

      toast.info("Collaborator Role Updated", {
        description: `${updatedBy.name} updated collaborator ${
          updatedUser.name
        }'s role from "${formatRole(prevRole)}" to "${formatRole(newRole)}"`,
        position: "top-right",
      });
    };

    socket.on("collaborator:settings:role", handleCollaboratorRoleChange);
    return () => {
      socket.off("collaborator:settings:role", handleCollaboratorRoleChange);
    };
  }, [socket, user?.id]);

  return null;
};
