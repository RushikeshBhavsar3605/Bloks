"use client";

import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Title } from "./title";
import { SocketIndicator } from "../socket-indicator";
import { useSocket } from "../providers/socket-provider";
import { SaveIndicator } from "../save-indicator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CollaboratorsSetting } from "./collaborators-setting";
import { DocumentWithMeta } from "@/types/shared";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const { socket } = useSocket();
  const params = useParams();
  const [document, setDocument] = useState<DocumentWithMeta>();

  const fetchDocuments = async () => {
    const response = await fetch(
      `/api/socket/documents/${params?.documentId as string}`
    );
    const data = await response.json();
    setDocument(data);
  };

  if (document?.id != params?.documentId) {
    fetchDocuments();
  }

  useEffect(() => {
    if (!socket) return;

    if (!document?.id) return;
    const handleUpdate = (data: DocumentWithMeta) => {
      setDocument(data);
    };

    socket.on(`document:update:${document.id}`, handleUpdate);

    return () => {
      socket.off(`document:update:${document.id}`, handleUpdate);
    };
  }, [socket, document?.id]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (document === undefined) {
    return <p>Loading...</p>;
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
    </>
  );
};
