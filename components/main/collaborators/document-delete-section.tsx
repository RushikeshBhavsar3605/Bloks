"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Archive, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface DocumentDeleteSectionProps {
  documentId: string;
  documentTitle?: string;
  isOwner: boolean;
  documentIsArchived: boolean;
}

export const DocumentDeleteSection = ({
  documentId,
  documentTitle,
  isOwner,
  documentIsArchived,
}: DocumentDeleteSectionProps) => {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Function to handle restore document
  const handleRestoreDocument = async () => {
    try {
      const response = await fetch(`/api/socket/documents/${documentId}/restore`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to restore document");
      }

      toast.success("Document restored successfully", {
        description: "Document moved back to active documents",
      });
      setShowRestoreDialog(false);
    } catch (error: any) {
      toast.error("Failed to restore document", {
        description: error.message || "An error occurred while restoring the document",
      });
      console.error("Restore document error:", error);
    }
  };

  // Function to handle archive document
  const handleArchiveDocument = async () => {
    try {
      const response = await fetch(`/api/socket/documents/${documentId}/archive`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to archive document");
      }

      toast.success("Document archived successfully", {
        description: "Document moved to archive and can be restored later",
      });
      setShowArchiveDialog(false);
    } catch (error: any) {
      toast.error("Failed to archive document", {
        description: error.message || "An error occurred while archiving the document",
      });
      console.error("Archive document error:", error);
    }
  };

  // Function to handle delete document
  const handleDeleteDocument = async () => {
    try {
      const response = await fetch(`/api/socket/documents/${documentId}/remove`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      toast.success("Document permanently deleted", {
        description: "Document and all its content have been permanently removed",
      });
      setShowDeleteDialog(false);

      // Redirect to documents page after deletion
      window.location.href = "/documents";
    } catch (error: any) {
      toast.error("Failed to delete document", {
        description: error.message || "An error occurred while deleting the document",
      });
      console.error("Delete document error:", error);
    }
  };

  // Only render for owners
  if (!isOwner) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Restore Section - Only for Archived Documents */}
      {documentIsArchived && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                Restore Document
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Move this document back to active documents and restore access for collaborators.
              </p>
              <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                <DialogTrigger asChild>
                  <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                    <RotateCcw className="w-4 h-4" />
                    Restore Document
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
                          {documentTitle || "Untitled"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Are you sure you want to restore this document?
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        The document will be moved back to active documents.
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
                        onClick={handleRestoreDocument}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Restore Document
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}

      {/* Archive Section - Only for Non-Archived Documents */}
      {!documentIsArchived && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Archive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Archive Document
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Move this document to archive. It can be restored later from the trash.
              </p>
              <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <DialogTrigger asChild>
                  <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors">
                    <Archive className="w-4 h-4" />
                    Archive Document
                  </button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-md bg-background dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] text-gray-900 dark:text-white">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Archive Document
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {documentTitle || "Untitled"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Are you sure you want to archive this document?
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        The document will be moved to trash and can be restored later.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <button
                        onClick={() => setShowArchiveDialog(false)}
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleArchiveDocument}
                        className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Archive Document
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section - Only for Archived Documents */}
      {documentIsArchived && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                Delete Document
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Permanently delete this document and all its content. This action cannot be undone.
              </p>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Delete Document
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
                          Delete Document
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {documentTitle || "Untitled"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Are you sure you want to permanently delete this document? This action will:
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
                        onClick={handleDeleteDocument}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Delete Document
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
