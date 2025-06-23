"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect } from "react";
import { toast } from "sonner";

export const CollaboratorRemoveToast = () => {
  const { socket } = useSocket();
  const user = useCurrentUser();

  useEffect(() => {
    if (!socket) return;

    const handleCollaboratorRemove = (data: {
      addedBy: { id: string; name: string };
      documentId: string;
      documentTitle: string;
      removedUser: {
        id: string;
        name: string;
      };
    }) => {
      const { addedBy, documentId, documentTitle, removedUser } = data;
      if (addedBy.id === user?.id) return;

      toast.info("Collaborator Removed", {
        description: `${addedBy.name} removed ${removedUser.name} from collaborating on "${documentTitle}"`,
        position: "top-right",
      });
    };

    socket.on("collaborator:settings:remove", handleCollaboratorRemove);
    return () => {
      socket.off("collaborator:settings:remove", handleCollaboratorRemove);
    };
  }, [socket, user?.id]);

  return null;
};
