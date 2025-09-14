import { useCurrentUser } from "@/hooks/use-current-user";
import { DocumentWithMeta } from "@/types/shared";
import { useSocket } from "../providers/socket-provider";
import { useEffect, useState } from "react";
import {
  CheckSquare,
  Clock,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  User,
  AlertTriangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface DocumentItemProps {
  doc: DocumentWithMeta;
  searchQuery: string;
  selectedItems: string[];
  onSelectItem: (docId: string) => void;
  onDocumentRestore: (docId: string) => void;
  onDocumentDelete: (docId: string) => void;
  handleDocumentRestore: (data: {
    restoredDocument: Document;
    restoredIds: string[];
  }) => void;
  handleDocumentRemove: (data: { removedIds: string[] }) => void;
  canSelect: boolean;
  canAction: boolean;
  highlightMatch: (text: string, query: string) => React.ReactNode;
}

export const DocumentItem = ({
  doc,
  searchQuery,
  selectedItems,
  onSelectItem,
  onDocumentRestore,
  onDocumentDelete,
  handleDocumentRestore,
  handleDocumentRemove,
  canSelect,
  canAction,
  highlightMatch,
}: DocumentItemProps) => {
  const isSelected = selectedItems.includes(doc.id);
  const user = useCurrentUser();
  const { socket, joinDocument, leaveDocument } = useSocket();
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRestoreClick = () => {
    onDocumentRestore(doc.id);
    setShowRestoreDialog(false);
  };

  const handleDeleteClick = () => {
    onDocumentDelete(doc.id);
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    if (!socket || !doc.id || !user?.id) return;

    const userId = user.id;

    const restoreEvent = `document:restore:${doc.parentDocumentId || "root"}`;
    const removeEvent = `document:remove:${doc.id}`;

    joinDocument(doc.id, userId);
    socket.on(restoreEvent, handleDocumentRestore);
    socket.on(removeEvent, handleDocumentRemove);

    return () => {
      leaveDocument(doc.id, userId);
      socket.off(restoreEvent, handleDocumentRestore);
      socket.off(removeEvent, handleDocumentRemove);
    };
  }, [
    socket,
    doc.id,
    doc.parentDocumentId,
    user?.id,
    handleDocumentRestore,
    handleDocumentRemove,
    joinDocument,
    leaveDocument,
  ]);

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#1A1A1C] border rounded-lg transition-colors ${
        canAction ? "hover:bg-gray-100 dark:hover:bg-[#1E1E20]" : ""
      } ${
        isSelected
          ? "border-red-500/50 bg-red-600/10"
          : "border-gray-200 dark:border-[#2A2A2E]"
      } ${!canAction ? "opacity-75" : ""}`}
    >
      {/* Checkbox - only for owned documents */}
      {canSelect ? (
        <button
          onClick={() => onSelectItem(doc.id)}
          className={`w-5 h-5 border-2 rounded transition-colors ${
            isSelected
              ? "border-red-500 bg-red-500"
              : "border-gray-400 dark:border-gray-600 hover:border-red-500"
          }`}
        >
          {isSelected && <CheckSquare className="w-5 h-5 text-white" />}
        </button>
      ) : (
        <div className="w-5 h-5" /> // Spacer for alignment
      )}

      {/* Document Icon */}
      <div className="flex-shrink-0">
        <span className="text-2xl">{doc.icon || "📄"}</span>
      </div>

      {/* Document Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {highlightMatch(doc.title, searchQuery)}
          </h4>
          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-[#2A2A2E] text-gray-600 dark:text-gray-400 rounded flex-shrink-0">
            Document
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{doc.owner.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Deleted {new Date(doc.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions - only for owned documents */}
      <div className="flex items-center gap-2">
        {canAction ? (
          <>
            {/* Restore Button with Confirmation */}
            <Dialog
              open={showRestoreDialog}
              onOpenChange={setShowRestoreDialog}
            >
              <DialogTrigger asChild>
                <button
                  className="p-2 hover:bg-green-600/20 rounded-lg transition-colors text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                  title="Restore"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-md bg-background dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] text-gray-900 dark:text-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Restore Document
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.title || "Untitled"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Are you sure you want to restore this document?
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      The document will be moved back to active documents and
                      access will be restored for collaborators.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => setShowRestoreDialog(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRestoreClick}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Restore Document
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Button with Confirmation */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <button
                  className="p-2 hover:bg-red-600/20 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                  title="Delete Forever"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-md bg-background dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] text-gray-900 dark:text-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete Document Forever
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.title || "Untitled"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Are you sure you want to permanently delete this document?
                      This action will:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li>• Permanently delete all document content</li>
                      <li>• Remove access for all collaborators</li>
                      <li>• Delete all comments and version history</li>
                    </ul>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      This action cannot be undone.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => setShowDeleteDialog(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
            <span className="text-xs">Read-only access</span>
          </div>
        )}
      </div>
    </div>
  );
};
