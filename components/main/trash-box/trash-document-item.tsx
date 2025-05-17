import { useSocket } from "@/components/providers/socket-provider";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DocumentWithMeta } from "@/types/shared";
import { Trash, Undo } from "lucide-react";
import { useEffect } from "react";

interface TrashDocumentItemProps {
  document: DocumentWithMeta;
  canRestore?: boolean;
  canDelete?: boolean;
  onClick: (id: string) => void;
  onRestore: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: string
  ) => void;
  onRemove: (id: string) => void;
  handleRestore: (data: DocumentWithMeta) => void;
  handleRemove: (id: string) => void;
}

export const TrashDocumentItem = ({
  document,
  canRestore = false,
  canDelete = false,
  onClick,
  onRestore,
  onRemove,
  handleRestore,
  handleRemove,
}: TrashDocumentItemProps) => {
  const user = useCurrentUser();
  const { socket, joinDocument, leaveDocument } = useSocket();

  // Join room for these document
  useEffect(() => {
    if (!socket || !document.id || !user?.id) return;

    const documentId = document.id;
    const userId = user.id;

    const restoreEvent = `document:restore:${
      document.parentDocumentId || "root"
    }`;
    const removeEvent = `document:remove:${
      document.parentDocumentId || "root"
    }`;

    joinDocument(documentId, userId);
    socket.on(restoreEvent, handleRestore);
    socket.on(removeEvent, handleRemove);

    return () => {
      leaveDocument(documentId, userId);
      socket.off(restoreEvent, handleRestore);
      socket.off(removeEvent, handleRemove);
    };
  }, [
    socket,
    document.id,
    document.parentDocumentId,
    user?.id,
    handleRestore,
    handleRemove,
    joinDocument,
    leaveDocument,
  ]);

  return (
    <div
      key={document.id}
      role="button"
      onClick={() => onClick(document.id)}
      className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
    >
      <span className="truncate pl-2">{document.title}</span>

      <div className="flex items-center">
        {canRestore && (
          <div
            onClick={(e) => onRestore(e, document.id)}
            role="button"
            className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
          >
            <Undo className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {canDelete && (
          <ConfirmModal
            onConfirm={() => onRemove(document.id)}
            title="Permanently Delete Document?"
            description={
              <>
                This action is irreversible.
                <br />
                The document{" "}
                <span className="text-red-500 dark:text-red-400 font-medium">
                  {document.title} (ID: {document.id})
                </span>{" "}
                will be:
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    Immediately removed from all collaborators&apos;s access
                  </li>
                  <li className="text-red-500 dark:text-red-400">
                    Permanently deleted from our servers
                  </li>
                  <li>Cannot be recovered through support or backups</li>
                </ul>
              </>
            }
          >
            <div
              role="button"
              className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              <Trash className="h-4 w-4 text-muted-foreground" />
            </div>
          </ConfirmModal>
        )}
      </div>
    </div>
  );
};
