"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Item } from "./item";
import { cn } from "@/lib/utils";
import { Collaborator, CollaboratorRole, Document } from "@prisma/client";
import { FileIcon } from "lucide-react";
import { useSocket } from "../providers/socket-provider";
import { DocumentWithMeta } from "@/types/shared";
import { useCurrentUser } from "@/hooks/use-current-user";

type RootDocuments = {
  ownedDocuments: Document[];
  sharedDocuments: DocumentWithMeta[];
};

interface DocumentListProps {
  parentDocumentId?: string;
  level?: number;
  data?: string;
  role?: CollaboratorRole | "OWNER" | null;
}

export const DocumentList = ({
  parentDocumentId,
  level = 0,
  role,
}: DocumentListProps) => {
  const { socket } = useSocket();
  const params = useParams();
  const user = useCurrentUser();
  const router = useRouter();
  const [documents, setDocuments] = useState<
    DocumentWithMeta[] | RootDocuments
  >([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const fetchDocuments = useCallback(async () => {
    if (!socket) return;
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
  }, [socket, parentDocumentId]);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (data: DocumentWithMeta) => {
      const isOwner = user?.id === data.userId;
      if (!role && !isOwner) return;

      data.isOwner = isOwner;
      data.role = role ?? null;

      setDocuments((prevDocs) => {
        if (prevDocs && Array.isArray(prevDocs)) {
          return [data, ...prevDocs];
        }

        if (prevDocs && !Array.isArray(prevDocs)) {
          return {
            ...prevDocs,
            ownedDocuments: [data, ...prevDocs.ownedDocuments],
          };
        }

        return prevDocs;
      });
    };

    const handleRestore = (
      data: Document & {
        owner: {
          name: string | null;
          image: string | null;
        };
        collaborators: Collaborator[];
      }
    ) => {
      const { collaborators, ...rest } = data;
      const isOwner = user?.id === rest.userId;
      const role: CollaboratorRole | "OWNER" | null = isOwner
        ? "OWNER"
        : collaborators.find((c) => c.userId === user?.id)?.role ?? null;

      const modifiedData: DocumentWithMeta = {
        ...rest,
        isOwner,
        role,
      };

      setDocuments((prevDocs) => {
        if (prevDocs && Array.isArray(prevDocs)) {
          return [modifiedData, ...prevDocs];
        }

        if (prevDocs && !Array.isArray(prevDocs)) {
          if (modifiedData.isOwner) {
            return {
              ...prevDocs,
              ownedDocuments: [modifiedData, ...prevDocs.ownedDocuments],
            };
          } else {
            return {
              ...prevDocs,
              sharedDocuments: [modifiedData, ...prevDocs.sharedDocuments],
            };
          }
        }

        return prevDocs;
      });
    };

    const createEvent = `document:created:${parentDocumentId || "root"}`;
    const restoreEvent = `document:restore:${parentDocumentId || "root"}`;

    socket.on(createEvent, handleCreated);
    socket.on(restoreEvent, handleRestore);

    return () => {
      socket.off(createEvent, handleCreated);
      socket.off(restoreEvent, handleRestore);
    };
  }, [socket, fetchDocuments, user?.id, role, parentDocumentId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleArchived = useCallback((id: string) => {
    console.log("Archived: ", id);
    setDocuments((prevDocs) => {
      if (prevDocs && Array.isArray(prevDocs)) {
        return prevDocs.filter((doc) => doc.id !== id);
      }

      if (prevDocs && !Array.isArray(prevDocs)) {
        return {
          ...prevDocs,
          ownedDocuments: prevDocs.ownedDocuments.filter(
            (doc) => doc.id !== id
          ),
          sharedDocuments: prevDocs.sharedDocuments.filter(
            (doc) => doc.id !== id
          ),
        };
      }

      return prevDocs;
    });
  }, []);

  const handleUpdateTitle = useCallback(
    ({ documentId, title }: { documentId: string; title: string }) => {
      console.log("Update Tite: ", documentId, title);
      setDocuments((prevDocs) => {
        if (Array.isArray(prevDocs)) {
          return prevDocs.map((doc) =>
            doc.id == documentId ? { ...doc, title } : doc
          );
        }

        if (prevDocs && !Array.isArray(prevDocs)) {
          return {
            ...prevDocs,
            ownedDocuments: prevDocs.ownedDocuments.map((doc) =>
              doc.id === documentId ? { ...doc, title } : doc
            ),
            sharedDocuments: prevDocs.sharedDocuments.map((doc) =>
              doc.id === documentId ? { ...doc, title } : doc
            ),
          };
        }

        return prevDocs;
      });
    },
    []
  );

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

      {!Array.isArray(documents) && documents?.ownedDocuments?.length > 0 && (
        <div className="text-gray-700 dark:text-gray-400 text-sm font-medium px-3 py-2 mt-4 tracking-wide">
          Private Documents
        </div>
      )}

      {!Array.isArray(documents) &&
        documents.ownedDocuments?.map((document) => (
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
              role={"OWNER"}
              handleArchived={handleArchived}
              handleUpdateTitle={handleUpdateTitle}
            />

            {expanded[document.id] && (
              <DocumentList parentDocumentId={document.id} level={level + 1} />
            )}
          </div>
        ))}

      {!Array.isArray(documents) && documents?.sharedDocuments?.length > 0 && (
        <div className="text-gray-700 dark:text-gray-400 text-sm font-medium px-3 py-2 mt-4 tracking-wide">
          Shared
        </div>
      )}

      {!Array.isArray(documents) &&
        documents.sharedDocuments?.map((document) => (
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
              role={document.role}
              handleArchived={handleArchived}
              handleUpdateTitle={handleUpdateTitle}
            />

            {expanded[document.id] && (
              <DocumentList
                parentDocumentId={document.id}
                level={level + 1}
                role={document.role}
              />
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
              role={document.role}
              handleArchived={handleArchived}
              handleUpdateTitle={handleUpdateTitle}
            />

            {expanded[document.id] && (
              <DocumentList
                parentDocumentId={document.id}
                level={level + 1}
                role={document.role}
              />
            )}
          </div>
        ))}
    </>
  );
};
