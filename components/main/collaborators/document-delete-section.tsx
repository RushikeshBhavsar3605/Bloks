"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface DocumentDeleteSectionProps {
  documentId: string;
  documentTitle?: string;
  isOwner: boolean;
}

export const DocumentDeleteSection = ({
  documentId,
  documentTitle,
  isOwner,
}: DocumentDeleteSectionProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Function to handle delete document
  // Include correct path pending
  const handleDeleteDocument = async () => {
    try {
      const response = await fetch(`/api/socket/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      toast.success("Document deleted successfully");
      setShowDeleteDialog(false);

      // Redirect to documents page after deletion
      window.location.href = "/documents";
    } catch (error: any) {
      toast.error("Failed to delete document", {
        description:
          error.message || "An error occurred while deleting the document",
      });
      console.error("Delete document error:", error);
    }
  };

  // Only render for owners
  if (!isOwner) {
    return null;
  }

  return (
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
            Permanently delete this document and all its content. This action
            cannot be undone.
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
                    Are you sure you want to delete this document? This action
                    will:
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
  );
};
