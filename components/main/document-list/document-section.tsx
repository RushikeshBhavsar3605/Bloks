import { DocumentWithMeta } from "@/types/shared";
import { DocumentItem } from "./document-item";

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
          handleArchived={handleArchived}
          handleUpdateTitle={handleUpdateTitle}
          activeDocumentId={activeDocumentId}
        />
      ))}
    </div>
  );
};
