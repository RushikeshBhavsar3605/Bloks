"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Item } from "../item";
import { Collaborator, CollaboratorRole, Document } from "@prisma/client";
import { useSocket } from "../../providers/socket-provider";
import { DocumentWithMeta } from "@/types/shared";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DocumentSection } from "./document-section";
import { DocumentEmpty } from "./document-empty";

type RootDocuments = {
  ownedDocuments: DocumentWithMeta[];
  sharedDocuments: DocumentWithMeta[];
};

interface DocumentTreeProps {
  parentDocumentId?: string;
  level?: number;
  data?: string;
  role?: CollaboratorRole | "OWNER" | null;
}

export const DocumentTree = ({
  parentDocumentId,
  level = 0,
  role,
}: DocumentTreeProps) => {
  const { socket } = useSocket();
  const params = useParams();
  const user = useCurrentUser();
  const router = useRouter();
  const [documents, setDocuments] = useState<
    DocumentWithMeta[] | RootDocuments
  >([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const fetchDocuments = useCallback(async () => {
    if (!socket) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [socket, parentDocumentId]);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (data: DocumentWithMeta) => {
      const isOwner = user?.id === data.userId;
      if (!role && !isOwner) return;

      data.isOwner = isOwner;
      data.role = isOwner ? "OWNER" : role ?? null;

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
      const { collaborators, ...rest } = data.restoredDocument;
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

  const handleCollaboratorRemove = (data: {
    addedBy: {
      name: string;
      id: string;
    };
    documentId: string;
    documentTitle: string;
    removedUser: {
      name: string;
      id: string;
    };
  }) => {
    if (user?.id !== data.removedUser.id) return;

    setDocuments((prevDocs) => {
      if (Array.isArray(prevDocs)) {
        return prevDocs.filter((doc) => doc.id !== data.documentId);
      }

      if (prevDocs && !Array.isArray(prevDocs)) {
        return {
          ...prevDocs,
          ownedDocuments: prevDocs.ownedDocuments.filter(
            (doc) => doc.id !== data.documentId
          ),
          sharedDocuments: prevDocs.sharedDocuments.filter(
            (doc) => doc.id !== data.documentId
          ),
        };
      }

      return prevDocs;
    });

    router.replace("/documents");
  };

  const handleCollaboratorRoleChange = (data: {
    documentId: string;
    updatedBy: {
      id: string;
      name: string;
    };
    updatedUser: {
      id: string;
      name: string;
    };
    newRole: CollaboratorRole;
    prevRole: CollaboratorRole;
  }) => {
    if (user?.id !== data.updatedUser.id) return;

    setDocuments((prevDocs) => {
      if (Array.isArray(prevDocs)) {
        return prevDocs.map((doc) =>
          doc.id === data.documentId ? { ...doc, role: data.newRole } : doc
        );
      }

      if (prevDocs && !Array.isArray(prevDocs)) {
        return {
          ...prevDocs,
          ownedDocuments: prevDocs.ownedDocuments.map((doc) =>
            doc.id === data.documentId ? { ...doc, role: data.newRole } : doc
          ),
          sharedDocuments: prevDocs.sharedDocuments.map((doc) =>
            doc.id === data.documentId ? { ...doc, role: data.newRole } : doc
          ),
        };
      }

      return prevDocs;
    });
  };

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const checkIsDocumentEmpty = (): boolean => {
    if (Array.isArray(documents) && documents.length === 0) return true;
    return false;
  };

  if (loading) {
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
      <DocumentEmpty
        level={level}
        expanded={!loading && checkIsDocumentEmpty()}
      />

      {!Array.isArray(documents) && documents?.ownedDocuments?.length > 0 && (
        <DocumentSection
          title="Private Documents"
          documents={documents.ownedDocuments}
          level={level}
          expanded={expanded}
          onExpand={onExpand}
          onRedirect={onRedirect}
          handleArchived={handleArchived}
          handleUpdateTitle={handleUpdateTitle}
          handleCollaboratorRemove={handleCollaboratorRemove}
          handleCollaboratorRoleChange={handleCollaboratorRoleChange}
          activeDocumentId={params?.documentId as string}
        />
      )}

      {!Array.isArray(documents) && documents?.sharedDocuments?.length > 0 && (
        <DocumentSection
          title="Shared"
          documents={documents.sharedDocuments}
          level={level}
          expanded={expanded}
          onExpand={onExpand}
          onRedirect={onRedirect}
          handleArchived={handleArchived}
          handleUpdateTitle={handleUpdateTitle}
          handleCollaboratorRemove={handleCollaboratorRemove}
          handleCollaboratorRoleChange={handleCollaboratorRoleChange}
          activeDocumentId={params?.documentId as string}
        />
      )}

      {Array.isArray(documents) && (
        <DocumentSection
          documents={documents}
          level={level}
          expanded={expanded}
          onExpand={onExpand}
          onRedirect={onRedirect}
          handleArchived={handleArchived}
          handleUpdateTitle={handleUpdateTitle}
          handleCollaboratorRemove={handleCollaboratorRemove}
          handleCollaboratorRoleChange={handleCollaboratorRoleChange}
          activeDocumentId={params?.documentId as string}
        />
      )}
    </>
  );
};
