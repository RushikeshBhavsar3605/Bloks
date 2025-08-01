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
  handleArchived,
  handleUpdateTitle,
  handleCollaboratorRemove,
  handleCollaboratorRoleChange,
  activeDocumentId,
}: DocumentSectionProps) => {
  return (
    <div className="space-y-1">
      {title && (
        <div className="text-xs font-medium text-gray-500 mb-3 px-2 mt-8">
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
