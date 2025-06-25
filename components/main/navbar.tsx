"use client";

import { MenuIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Title } from "./title";
import { SocketIndicator } from "../socket-indicator";
import { useSocket } from "../providers/socket-provider";
import { SaveIndicator } from "../save-indicator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CollaboratorsSetting } from "./collaborators/collaborators-setting";
import { DocumentWithMeta } from "@/types/shared";
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
  const [document, setDocument] = useState<DocumentWithMeta>();

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

      const data = (await response.json()) as DocumentWithMeta;

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
    if (!socket) return;

    if (!document?.id) return;
    const handleUpdate = (data: DocumentWithMeta) => {
      setDocument(data);
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

    socket.on(`document:update:${document.id}`, handleUpdate);
    socket.on(`document:archived:${document.id}`, handleArchived);
    socket.on(
      `document:restore:${document.parentDocumentId || "root"}`,
      handleRestore
    );

    return () => {
      socket.off(`document:update:${document.id}`, handleUpdate);
      socket.off(`document:archived:${document.id}`, handleArchived);
      socket.on(
        `document:restore:${document.parentDocumentId || "root"}`,
        handleRestore
      );
    };
  }, [socket, document]);

  if (document === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}

        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />
          <div className="flex items-center gap-x-2">
            <Menu documentId={document.id} />
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <Popover>
            <PopoverTrigger>
              <Button
                variant="secondary"
                size="xs"
                className="bg-primary/5 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                Share
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[500px]">
              <CollaboratorsSetting documentId={document.id} />
            </PopoverContent>
          </Popover>
          <SaveIndicator />
          <SocketIndicator />
        </div>
      </nav>

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
