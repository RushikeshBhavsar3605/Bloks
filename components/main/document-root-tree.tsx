"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Item } from "./item";
import { cn } from "@/lib/utils";
import { CollaboratorRole, Document } from "@prisma/client";
import { FileIcon } from "lucide-react";
import { useSocket } from "../providers/socket-provider";
import { DocumentList } from "./document-list";

type ownedDocsWithMeta = Document & {
  isOwner: boolean;
  role: CollaboratorRole;
};

type collaboratedDocuments = Document & {
  isCollaborator: boolean;
  role: CollaboratorRole;
};

type RootDocuments = {
  owned: ownedDocsWithMeta[];
  collaborated: collaboratedDocuments[];
  all: (ownedDocsWithMeta | collaboratedDocuments)[];
  type: "Root";
};
interface DocumentRootTreeProps {
  parentDocumentId?: string;
  level?: number;
  data?: string;
}

export const DocumentRootTree = ({
  parentDocumentId,
  level = 0,
}: DocumentRootTreeProps) => {
  const { socket } = useSocket();
  const params = useParams();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[] | RootDocuments>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const fetchDocuments = async () => {
    try {
      let data;
      if (!parentDocumentId) {
        const res = await fetch("/api/socket/documents");
        data = await res.json();
      } else {
        const res = await fetch(
          `/api/socket/documents?parentDocumentId=${parentDocumentId}`
        );
        data = await res.json();
      }

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
      if (Array.isArray(documents)) {
        setDocuments((prevDocs) => {
          if (Array.isArray(prevDocs)) {
            return prevDocs.map((doc) =>
              doc.id == id ? { ...doc, title } : doc
            );
          }

          return prevDocs;
        });
      } else {
        setDocuments((prevDocs) => {
          if (!Array.isArray(prevDocs) && documents.type === "Root") {
            return {
              ...prevDocs,
              owned: prevDocs.owned.map((doc) =>
                doc.id === id ? { ...doc, title } : doc
              ),
              collaborated: prevDocs.collaborated.map((doc) =>
                doc.id === id ? { ...doc, title } : doc
              ),
              all: prevDocs.all.map((doc) =>
                doc.id === id ? { ...doc, title } : doc
              ),
            };
          }

          return prevDocs;
        });
      }
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

      {!Array.isArray(documents) &&
        documents.owned.map((document) => (
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

      {Array.isArray(documents) &&
        documents.map((document) => (
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
