import { DocumentWithMeta } from "@/types/shared";
import { DocumentItem } from "./document-item";
import { CollaboratorRole } from "@prisma/client";

interface DocumentSectionProps {
  title?: string;
  documents: DocumentWithMeta[];
  level: number;
  expanded: Record<string, boolean>;
  onExpand: (documentId: string) => void;
  onRedirect: (documentId: string) => void;
  handleUpdate: (data: DocumentWithMeta) => void;
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

export const DocumentSection = ({
  title,
  documents,
  level,
  expanded,
  onExpand,
  onRedirect,
  handleUpdate,
  handleArchived,
  handleUpdateTitle,
  handleCollaboratorRemove,
  handleCollaboratorRoleChange,
  activeDocumentId,
}: DocumentSectionProps) => {
  return (
    <div>
      {title && (
        <div className="text-gray-700 dark:text-gray-400 text-sm font-medium px-3 py-2 mt-4 tracking-wide">
          {title}
        </div>
      )}

      {documents.map((document) => (
        <DocumentItem
          key={document.id}
          document={document}
          level={level}
          expanded={expanded}
          onExpand={onExpand}
          onRedirect={onRedirect}
          role={document.role}
          handleUpdate={handleUpdate}
          handleArchived={handleArchived}
          handleUpdateTitle={handleUpdateTitle}
          handleCollaboratorRemove={handleCollaboratorRemove}
          handleCollaboratorRoleChange={handleCollaboratorRoleChange}
          activeDocumentId={activeDocumentId}
        />
      ))}
    </div>
  );
};
