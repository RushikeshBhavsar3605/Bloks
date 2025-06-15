import { useCurrentUser } from "@/hooks/use-current-user";
import { useSocket } from "../providers/socket-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { showCollaboratorInviteToast } from "@/lib/toasts/show-collaborator-toast";

export const CollaboratorInviteListener = () => {
  const { socket } = useSocket();
  const user = useCurrentUser();
  const router = useRouter();

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

      const openDocument = () =>
        window.open(
          `/documents/${data.newCollaborator.documentId}`,
          "_blank",
          "noopener,noreferrer"
        );

      showCollaboratorInviteToast({
        newCollaborator: data.newCollaborator,
        userExist: data.userExist,
        openDocument,
      });
    };

    socket.on("collaborator:settings:invite", handleCollaboratorInvite);
    return () => {
      socket.off("collaborator:settings:invite", handleCollaboratorInvite);
    };
  }, [socket, user?.id, router]);

  return null;
};
