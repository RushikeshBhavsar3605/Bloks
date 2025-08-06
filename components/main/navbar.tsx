"use client";

import { MenuIcon, Share2, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Title } from "./title";
import { SocketIndicator } from "../socket-indicator";
import { useSocket } from "../providers/socket-provider";
import { SaveIndicator } from "../save-indicator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";
import { CollaboratorsSetting } from "./collaborators/collaborators-setting";
import { CollaboratorWithMeta, DocumentWithMeta } from "@/types/shared";
import { toast } from "sonner";
import { Banner } from "./banner";
import { Collaborator, Document } from "@prisma/client";
import { Menu } from "./menu";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const router = useRouter();
  const { socket } = useSocket();
  const params = useParams();
  const [document, setDocument] = useState<
    DocumentWithMeta & { collaborators: CollaboratorWithMeta[] }
  >();

  const fetchDocuments = useCallback(async () => {
    try {
      if (!params?.documentId) {
        return router.push("/documents");
      }

      const response = await fetch(
        `/api/socket/documents/${params?.documentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as DocumentWithMeta & {
        collaborators: CollaboratorWithMeta[];
      };

      setDocument(data);
    } catch (error) {
      console.error("Failed to fetch document:", error);
      toast.error("Failed to load document");
      router.push("/documents");
    }
  }, [params?.documentId, router]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (!socket || !document?.id) return;

    const handleUpdateTitle = ({
      documentId,
      title,
      icon,
    }: {
      documentId: string;
      title?: string;
      icon?: string;
    }) => {
      setDocument((doc) => {
        if (!doc) return doc;
        return {
          ...doc,
          ...(title !== undefined && { title }),
          ...(icon !== undefined && { icon }),
        };
      });
    };

    const handleArchived = (id: string) => {
      setDocument((prev) => (prev ? { ...prev, isArchived: true } : undefined));
    };

    const handleRestore = (data: {
      restoredDocument: Document & {
        owner: {
          name: string | null;
          image: string | null;
        };
        collaborators: Collaborator[];
      };
      restoredIds: string[];
    }) => {
      const restoredIdsSet = new Set(data.restoredIds);

      if (restoredIdsSet.has(document.id)) {
        setDocument((prev) =>
          prev ? { ...prev, isArchived: false } : undefined
        );
      }
    };

    const titleChangeEvent = `document:receive:title:${document.id}`;

    socket.on(titleChangeEvent, handleUpdateTitle);
    socket.on(`document:archived:${document.id}`, handleArchived);
    socket.on(
      `document:restore:${document.parentDocumentId || "root"}`,
      handleRestore
    );

    return () => {
      socket.off(titleChangeEvent, handleUpdateTitle);
      socket.off(`document:archived:${document.id}`, handleArchived);
      socket.off(
        `document:restore:${document.parentDocumentId || "root"}`,
        handleRestore
      );
    };
  }, [socket, document]);

  if (document === undefined) {
    return (
      <header className="h-[72px] flex items-center justify-between px-8 border-b border-gray-200 dark:border-[#1E1E20] bg-background dark:bg-[#0B0B0F]">
        <div className="flex items-center gap-4">
          {isCollapsed && (
            <Skeleton className="h-9 w-9" />
          )}
          <Skeleton className="h-9 w-9" />
          <Title.Skeleton />
        </div>
        <div className="flex items-center gap-3">
          <Menu.Skeleton />
        </div>
      </header>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <>
      <header className="h-[72px] flex items-center justify-between px-8 border-b border-gray-200 dark:border-[#1E1E20] bg-background dark:bg-[#0B0B0F]">
        <div className="flex items-center gap-4">
          {isCollapsed && (
            <button
              onClick={onResetWidth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => router.push("/documents")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{document.icon || "📄"}</span>
            <Title initialData={document} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Collaborators */}
          <div className="flex items-center -space-x-2">
            {document.collaborators?.slice(0, 3).map((collaborator, index) => (
              <div
                key={collaborator.id}
                className="w-7 h-7 bg-blue-600 rounded-full border-2 border-background dark:border-[#0B0B0F] flex items-center justify-center text-xs font-medium text-white"
                title={collaborator.user.name || "Collaborator"}
              >
                {collaborator.user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </div>
            ))}
          </div>
          
          {/* Share Button */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px]">
              <CollaboratorsSetting documentId={document.id} />
            </PopoverContent>
          </Popover>
          
          {/* Save and Socket Indicators */}
          <div className="flex items-center gap-1">
            <SaveIndicator />
            <SocketIndicator />
          </div>
          
          {/* Menu */}
          <Menu documentId={document.id} />
        </div>
      </header>

      {document.isArchived && (
        <Banner
          documentId={document.id}
          documentTitle={document.title}
          isOwner={document.isOwner}
        />
      )}
    </>
  );
};