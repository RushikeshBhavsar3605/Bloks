import { DocumentWithMeta } from "@/types/shared";
import { Item } from "../item";
import { FileIcon, FileText } from "lucide-react";
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
  handleDocHeaderChange: ({
    documentId,
    userId,
    title,
    icon,
  }: {
    documentId: string;
    userId: string;
    title: string;
    icon: string;
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
  handleCollaboratorRoleChange: ({
    updatedBy,
    updatedUser,
    newRole,
    prevRole,
  }: {
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
  handleDocHeaderChange,
  handleCollaboratorRemove,
  handleCollaboratorRoleChange,
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
      !handleDocHeaderChange
    )
      return;

    const documentId = document.id;
    const userId = user.id;

    const archiveEvent = `document:archived:${document.id}`;
    const docHeaderChange = `doc-header-change`;
    const collaboratorRemoveEvent = "collaborator:settings:remove";
    const collaboratorRoleChangeEvent = "collaborator:settings:role";

    joinDocument(documentId, userId);
    socket.on(archiveEvent, handleArchived);
    socket.on(docHeaderChange, handleDocHeaderChange);
    socket.on(collaboratorRemoveEvent, handleCollaboratorRemove);
    socket.on(collaboratorRoleChangeEvent, handleCollaboratorRoleChange);

    return () => {
      leaveDocument(documentId, userId);
      socket.off(archiveEvent, handleArchived);
      socket.off(docHeaderChange, handleDocHeaderChange);
      socket.off(collaboratorRemoveEvent, handleCollaboratorRemove);
      socket.off(collaboratorRoleChangeEvent, handleCollaboratorRoleChange);
    };
  }, [
    socket,
    document.id,
    user?.id,
    joinDocument,
    leaveDocument,
    handleArchived,
    handleDocHeaderChange,
    handleCollaboratorRemove,
    handleCollaboratorRoleChange,
  ]);

  return (
    <div>
      <Item
        id={document.id}
        onClick={() => onRedirect(document.id)}
        label={document.title}
        icon={FileText}
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
