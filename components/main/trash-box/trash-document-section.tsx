import { TrashDocumentItem } from "./trash-document-item";
import { Separator } from "@/components/ui/separator";
import { DocumentWithMeta } from "@/types/shared";

interface TrashDocumentSectionProps {
  label: string;
  documents: DocumentWithMeta[];
  onClick: (id: string) => void;
  onRestore: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: string
  ) => void;
  onRemove: (id: string) => void;
  handleRestore: (data: DocumentWithMeta) => void;
  handleRemove: (id: string) => void;
}

export const TrashDocumentSection = ({
  label,
  documents,
  onClick,
  onRestore,
  onRemove,
  handleRestore,
  handleRemove,
}: TrashDocumentSectionProps) => {
  return (
    <div className="mb-4">
      <div className="text-gray-700 dark:text-gray-400 text-sm font-medium px-2 py-2">
        {label}
      </div>
      <Separator className="mx-2 w-auto h-[1.5px]" />
      {documents?.map((document: DocumentWithMeta) => (
        <TrashDocumentItem
          key={document.id}
          document={document}
          canRestore
          canDelete
          onClick={onClick}
          onRestore={onRestore}
          onRemove={onRemove}
          handleRestore={handleRestore}
          handleRemove={handleRemove}
        />
      ))}
    </div>
  );
};
