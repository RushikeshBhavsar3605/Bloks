import { DocumentWithMeta } from "@/types/shared";
import { Item } from "../item";
import { FileIcon } from "lucide-react";
import { CollaboratorRole } from "@prisma/client";
import { DocumentTree } from "./document-tree";
import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect } from "react";

interface DocumentItemProps {
  document: DocumentWithMeta;
  level: number;
  expanded: Record<string, boolean>;
  onExpand: (document: string) => void;
  onRedirect: (document: string) => void;
  role: CollaboratorRole | "OWNER" | null;
  handleArchived: (id: string) => void;
  handleUpdateTitle: ({
    documentId,
    title,
  }: {
    documentId: string;
    title: string;
  }) => void;
  handleCollaboratorRemove: ({
    addedBy,
    documentId,
    documentTitle,
    removedUser,
  }: {
    addedBy: {
      name: string;
      id: string;
    };
    documentId: string;
    documentTitle: string;
    removedUser: {
      name: string;
      id: string;
    };
  }) => void;
  activeDocumentId?: string;
}

export const DocumentItem = ({
  document,
  level,
  expanded,
  onExpand,
  onRedirect,
  role,
  handleArchived,
  handleUpdateTitle,
  handleCollaboratorRemove,
  activeDocumentId,
}: DocumentItemProps) => {
  const user = useCurrentUser();
  const { socket, joinDocument, leaveDocument } = useSocket();

  // Join room for these document
  useEffect(() => {
    if (
      !socket ||
      !document.id ||
      !user?.id ||
      !handleArchived ||
      !handleUpdateTitle
    )
      return;

    const documentId = document.id;
    const userId = user.id;

    const archiveEvent = `document:archived:${document.id}`;
    const titleChangeEvent = `document:receive:title:${document.id}`;
    const collaboratorRemoveEvent = "collaborator:settings:remove";

    joinDocument(documentId, userId);
    socket.on(archiveEvent, handleArchived);
    socket.on(titleChangeEvent, handleUpdateTitle);
    socket.on(collaboratorRemoveEvent, handleCollaboratorRemove);

    return () => {
      leaveDocument(documentId, userId);
      socket.off(archiveEvent, handleArchived);
      socket.off(titleChangeEvent, handleUpdateTitle);
      socket.off(collaboratorRemoveEvent, handleCollaboratorRemove);
    };
  }, [
    socket,
    document.id,
    user?.id,
    joinDocument,
    leaveDocument,
    handleArchived,
    handleUpdateTitle,
    handleCollaboratorRemove,
  ]);

  return (
    <div>
      <Item
        id={document.id}
        onClick={() => onRedirect(document.id)}
        label={document.title}
        icon={FileIcon}
        documentIcon={document.icon || undefined}
        active={activeDocumentId === document.id}
        level={level}
        onExpand={() => onExpand(document.id)}
        expanded={expanded[document.id]}
        role={role}
      />

      {expanded[document.id] && (
        <DocumentTree
          parentDocumentId={document.id}
          level={level + 1}
          role={document.role}
        />
      )}
    </div>
  );
};
