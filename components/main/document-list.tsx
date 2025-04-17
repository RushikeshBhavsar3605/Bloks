"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Item } from "./item";
import { cn } from "@/lib/utils";
import { Document } from "@prisma/client";
import { FileIcon } from "lucide-react";
import { useSocket } from "../providers/socket-provider";

interface DocumentListProps {
  parentDocumentId?: string;
  level?: number;
  data?: string;
}

export const DocumentList = ({
  parentDocumentId,
  level = 0,
}: DocumentListProps) => {
  const { socket } = useSocket();
  const params = useParams();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        `/api/socket/documents/fetch-all?parentDocument=${
          parentDocumentId || ""
        }`
      );
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.log("Failed to fetch documents", error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (data: Document) => {
      fetchDocuments();
    };

    const handleArchived = (data: Document) => {
      fetchDocuments();
    };

    const handleRestore = (data: Document) => {
      fetchDocuments();
    };

    const handleUpdateTitle = ({
      id,
      title,
    }: {
      id: string;
      title: string;
    }) => {
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => (doc.id == id ? { ...doc, title } : doc))
      );
    };

    socket.on("document:created", handleCreated);
    socket.on("document:archived", handleArchived);
    socket.on("document:restore", handleRestore);
    socket.on("document:receive:title", handleUpdateTitle);

    return () => {
      socket.off("document:created", handleCreated);
      socket.off("document:archived", handleArchived);
      socket.off("document:restore", handleRestore);
      socket.off("document:receive:title", handleUpdateTitle);
    };
  }, [socket]);

  useEffect(() => {
    fetchDocuments();
  }, [parentDocumentId]);

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  if (documents == undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <p
        style={{
          paddingLeft: level ? `${level * 12 + 25}px` : undefined,
        }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No pages inside
      </p>

      {documents.map((document) => (
        <div key={document.id}>
          <Item
            id={document.id}
            onClick={() => onRedirect(document.id)}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon || undefined}
            active={params?.documentId === document.id}
            level={level}
            onExpand={() => onExpand(document.id)}
            expanded={expanded[document.id]}
          />

          {expanded[document.id] && (
            <DocumentList parentDocumentId={document.id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  );
};
