import { useCurrentUser } from "@/hooks/use-current-user";
import { DocumentWithMeta } from "@/types/shared";
import { useSocket } from "../providers/socket-provider";
import { useEffect } from "react";
import {
  CheckSquare,
  Clock,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  User,
} from "lucide-react";

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
      className={`flex items-center gap-4 p-4 bg-[#1A1A1C] border rounded-lg transition-colors ${
        canAction ? "hover:bg-[#1E1E20]" : ""
      } ${
        isSelected ? "border-red-500/50 bg-red-600/10" : "border-[#2A2A2E]"
      } ${!canAction ? "opacity-75" : ""}`}
    >
      {/* Checkbox - only for owned documents */}
      {canSelect ? (
        <button
          onClick={() => onSelectItem(doc.id)}
          className={`w-5 h-5 border-2 rounded transition-colors ${
            isSelected
              ? "border-red-500 bg-red-500"
              : "border-gray-600 hover:border-red-500"
          }`}
        >
          {isSelected && <CheckSquare className="w-5 h-5 text-white" />}
        </button>
      ) : (
        <div className="w-5 h-5" /> // Spacer for alignment
      )}

      {/* Document Icon */}
      <div className="flex-shrink-0">
        <span className="text-2xl">📄</span>
      </div>

      {/* Document Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-white truncate">
            {highlightMatch(doc.title, searchQuery)}
          </h4>
          <span className="text-xs px-2 py-1 bg-[#2A2A2E] text-gray-400 rounded flex-shrink-0">
            Document
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
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
            <button
              onClick={() => onDocumentRestore(doc.id)}
              className="p-2 hover:bg-green-600/20 rounded-lg transition-colors text-green-400 hover:text-green-300"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDocumentDelete(doc.id)}
              className="p-2 hover:bg-red-600/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
              title="Delete Forever"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#2A2A2E] rounded-lg transition-colors text-gray-400 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-xs">Read-only access</span>
          </div>
        )}
      </div>
    </div>
  );
};
