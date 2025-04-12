"use client";

import { getDocumentById } from "@/actions/documents/get-documents";
import { Document } from "@prisma/client";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Title } from "./title";
import { SocketIndicator } from "../socket-indicator";
import { useSocket } from "../providers/socket-provider";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const { socket } = useSocket();
  const params = useParams();
  const [document, setDocument] = useState<Document>();

  const fetchDocuments = async () => {
    const data = await getDocumentById(params?.documentId as string);
    setDocument(data);
  };

  if (document?.id != params?.documentId) {
    fetchDocuments();
  }

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: Document) => {
      console.log("RUN");
      setDocument(data);
    };

    socket.on(`document:update`, handleUpdate);

    return () => {
      socket.off(`document:update`, handleUpdate);
    };
  }, [socket]);

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

        <div className="ml-auto flex items-center">
          <SocketIndicator />
        </div>
      </nav>
    </>
  );
};
