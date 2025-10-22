"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Settings } from "lucide-react";
import { CollaboratorsSetting } from "@/components/main/collaborators/collaborators-setting";
import { DocumentWithMeta, CollaboratorWithMeta } from "@/types/shared";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CollaboratorModal({ isOpen, onClose }: CollaboratorModalProps) {
  const params = useParams();
  const [document, setDocument] = useState<
    DocumentWithMeta & { collaborators: CollaboratorWithMeta[] }
  >();
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocument = async () => {
    try {
      if (!params?.documentId) {
        return;
      }

      setIsLoading(true);
      const response = await fetch(
        `/api/socket/documents/${params?.documentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as DocumentWithMeta & {
        collaborators: CollaboratorWithMeta[];
      };

      const owner: CollaboratorWithMeta & { isOwner: boolean } = {
        id: `owner-${data.userId}`,
        userId: data.userId,
        documentId: data.id,
        role: "EDITOR",
        createdAt: data.createdAt,
        isVerified: data.createdAt,
        isOwner: true,
        user: {
          id: data.userId,
          name: data.owner.name,
          email: data.owner.email as string,
          image: data.owner.image,
        },
      };

      data.collaborators.push(owner);
      setDocument(data);
    } catch (error) {
      console.error("Failed to fetch document:", error);
      toast.error("Failed to load document");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocument();
    }
  }, [isOpen, params?.documentId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDocument(undefined);
      setIsLoading(true);
    }
  }, [isOpen]);

  const updatePublishStatus = (isPublished: boolean) => {
    if (!document) {
      return;
    }
    setDocument({ ...document, isPublished });
  };

  if (!isOpen) return null;

  // Only show modal if we have a document ID (we're on a document page)
  if (!params?.documentId) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
          <div className="h-full p-6 flex items-center justify-center">
            <Spinner className="size-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#2A2A2E] rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Document not found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Unable to load document settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-6">
          <CollaboratorsSetting
            documentId={document.id}
            documentOwnerId={document.userId}
            documentTitle={document.title}
            documentIcon={document.icon}
            documentCreatedAt={document.createdAt}
            documentIsArchived={document.isArchived}
            documentIsPublished={document.isPublished}
            updatePublishStatus={updatePublishStatus}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
