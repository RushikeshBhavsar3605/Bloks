"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import { DocumentWithMeta } from "@/types/shared";
import { toast } from "sonner";
import { DocumentItem } from "./document-item";

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const [trashedDocuments, setTrashedDocuments] = useState<{
    ownedArchived: DocumentWithMeta[];
    sharedArchived: DocumentWithMeta[];
  }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "deleted" | "type">("deleted");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const onDocumentRestore = (documentId: string) => {
    const promise = fetch(`/api/socket/documents/${documentId}/restore`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored!",
      error: "Failed to restore note.",
    });
  };

  const onDocumentDelete = (documentId: string) => {
    const promise = fetch(`/api/socket/documents/${documentId}/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted!",
      error: "Failed to delete note.",
    });
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/socket/documents/trash");
        const data = await res.json();
        setTrashedDocuments(data);
      } catch (error) {
        console.log("Failed to fetch trash documents", error);
      }
    };

    fetchDocuments();
  }, [isOpen]);

  const handleDocumentRestore = (data: {
    restoredDocument: Document;
    restoredIds: string[];
  }) => {
    const restoredIdsSet = new Set(data.restoredIds);

    setTrashedDocuments((prevDocs) => {
      if (!prevDocs) return prevDocs;

      return {
        ...prevDocs,
        ownedArchived: prevDocs?.ownedArchived.filter(
          (doc) => !restoredIdsSet.has(doc.id)
        ),
        sharedArchived: prevDocs?.sharedArchived.filter(
          (doc) => !restoredIdsSet.has(doc.id)
        ),
      };
    });
  };

  const handleDocumentRemove = (data: { removedIds: string[] }) => {
    const removedIdsSet = new Set(data.removedIds);

    setTrashedDocuments((prevDocs) => {
      if (!prevDocs) return prevDocs;

      return {
        ...prevDocs,
        ownedArchived: prevDocs?.ownedArchived.filter(
          (doc) => !removedIdsSet.has(doc.id)
        ),
        sharedArchived: prevDocs?.sharedArchived.filter(
          (doc) => !removedIdsSet.has(doc.id)
        ),
      };
    });
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedItems([]);
    }
  }, [isOpen]);

  // Filter and sort documents by section
  const filterAndSortDocuments = (documents: DocumentWithMeta[]) => {
    return documents
      .filter((doc) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          doc.title.toLowerCase().includes(query) ||
          doc.owner.name?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.title.localeCompare(b.title);
          case "type":
            return "Document".localeCompare("Document"); // All are documents
          case "deleted":
          default:
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        }
      });
  };

  const filteredOwnedDocuments = trashedDocuments?.ownedArchived
    ? filterAndSortDocuments(trashedDocuments.ownedArchived)
    : [];

  const filteredSharedDocuments = trashedDocuments?.sharedArchived
    ? filterAndSortDocuments(trashedDocuments.sharedArchived)
    : [];

  const totalFilteredDocuments =
    filteredOwnedDocuments.length + filteredSharedDocuments.length;

  const handleSelectItem = (docId: string) => {
    setSelectedItems((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    // Only allow selection of owned documents
    if (selectedItems.length === filteredOwnedDocuments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredOwnedDocuments.map((doc) => doc.id));
    }
  };

  const handleBulkRestore = () => {
    selectedItems.forEach((docId) => {
      onDocumentRestore?.(docId);
    });
    setSelectedItems([]);
  };

  const handleBulkDelete = () => {
    selectedItems.forEach((docId) => {
      onDocumentDelete?.(docId);
    });
    setSelectedItems([]);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-red-600/30 text-red-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
      <div className="bg-[#161618] border border-[#1E1E20] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E1E20]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Trash</h2>
              <p className="text-sm text-gray-400">
                {totalFilteredDocuments} item
                {totalFilteredDocuments !== 1 ? "s" : ""} in trash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2E] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="flex-shrink-0 p-6 border-b border-[#1E1E20] space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in trash..."
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {filteredOwnedDocuments.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-3 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm rounded-lg transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  {selectedItems.length === filteredOwnedDocuments.length
                    ? "Deselect All"
                    : "Select All My Documents"}
                </button>
              )}

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkRestore}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore ({selectedItems.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Forever ({selectedItems.length})
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "deleted" | "type")
                }
                className="bg-[#2A2A2E] border border-[#323236] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="deleted">Date Deleted</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {totalFilteredDocuments === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#2A2A2E] rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? "No matching items in trash" : "Trash is empty"}
              </h3>
              <p className="text-gray-400 max-w-md">
                {searchQuery
                  ? `No items in trash match "${searchQuery}". Try different keywords.`
                  : "Deleted documents will appear here. You can restore them or delete them permanently."}
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* My Documents Section */}
              {filteredOwnedDocuments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    My Documents
                    <span className="text-sm font-normal text-gray-400">
                      ({filteredOwnedDocuments.length})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {filteredOwnedDocuments.map((doc) => (
                      <DocumentItem
                        key={doc.id}
                        doc={doc}
                        searchQuery={searchQuery}
                        selectedItems={selectedItems}
                        onSelectItem={handleSelectItem}
                        onDocumentRestore={onDocumentRestore}
                        onDocumentDelete={onDocumentDelete}
                        handleDocumentRestore={handleDocumentRestore}
                        handleDocumentRemove={handleDocumentRemove}
                        canSelect={true}
                        canAction={true}
                        highlightMatch={highlightMatch}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Shared with Me Section */}
              {filteredSharedDocuments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    Shared with Me
                    <span className="text-sm font-normal text-gray-400">
                      ({filteredSharedDocuments.length})
                    </span>
                    <span className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded">
                      Read-only
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {filteredSharedDocuments.map((doc) => (
                      <DocumentItem
                        key={doc.id}
                        doc={doc}
                        searchQuery={searchQuery}
                        selectedItems={selectedItems}
                        onSelectItem={handleSelectItem}
                        onDocumentRestore={onDocumentRestore}
                        onDocumentDelete={onDocumentDelete}
                        handleDocumentRestore={handleDocumentRestore}
                        handleDocumentRemove={handleDocumentRemove}
                        canSelect={false}
                        canAction={false}
                        highlightMatch={highlightMatch}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalFilteredDocuments > 0 && (
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-t border-[#1E1E20] bg-[#1A1A1C] rounded-b-2xl">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span>
                Items in trash will be permanently deleted after 30 days
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {selectedItems.length > 0 &&
                `${selectedItems.length} selected • `}
              {totalFilteredDocuments} item
              {totalFilteredDocuments !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
