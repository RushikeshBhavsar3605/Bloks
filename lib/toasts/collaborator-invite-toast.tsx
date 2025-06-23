"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect } from "react";
import { toast } from "sonner";

export const CollaboratorInviteToast = () => {
  const { socket } = useSocket();
  const user = useCurrentUser();

  useEffect(() => {
    if (!socket) return;

    const handleCollaboratorInvite = (data: {
      invited: boolean;
      userExist: boolean;
      newCollaborator: {
        userName?: string;
        email: string;
        documentId: string;
        documentTitle: string;
        addedBy: { name: string; id: string };
      };
    }) => {
      if (!data.invited) return;

      if (data.newCollaborator.addedBy.id === user?.id) return;

      const { userName, email, documentId, documentTitle, addedBy } =
        data.newCollaborator;
      const truncatedEmail =
        email.length > 25 ? `${email.substring(0, 25)}...` : email;
      const displayName = data.userExist ? userName : truncatedEmail;
      const truncatedTitle =
        documentTitle.length > 30
          ? `${documentTitle.substring(0, 30)}...`
          : documentTitle;

      toast.info("New Collaborator Invite", {
        description: `${addedBy.name} invited ${displayName} to ${
          !data.userExist ? "join and" : ""
        } collaborate on "${truncatedTitle}"`,
        position: "top-right",
      });
    };

    socket.on("collaborator:settings:invite", handleCollaboratorInvite);
    return () => {
      socket.off("collaborator:settings:invite", handleCollaboratorInvite);
    };
  }, [socket, user?.id]);

  return null;
};
