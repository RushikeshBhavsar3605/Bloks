"use client";

import { Toolbar } from "@/components/main/toolbar";
import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DocumentWithMeta } from "@/types/shared";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const DocumentIdPage = () => {
  const user = useCurrentUser();
  const { socket, joinActiveDocument, leaveActiveDocument } = useSocket();
  const params = useParams();
  const router = useRouter();
  const documentId = params?.documentId as string;
  const [document, setDocument] = useState<DocumentWithMeta>();

  const fetchDocuments = useCallback(async () => {
    try {
      if (!documentId) {
        return router.push("/documents");
      }

      const response = await fetch(`/api/socket/documents/${documentId}`);

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
  }, [documentId, router]);

  useEffect(() => {
    const userId = user?.id;

    if (!socket || !documentId || !userId) return;

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

    const handleUpdate = (data: DocumentWithMeta) => {
      setDocument(data);
    };

    const titleChangeEvent = `document:receive:title:${documentId}`;

    joinActiveDocument(documentId, userId);
    socket.on(titleChangeEvent, handleUpdateTitle);
    socket.on(`document:update:${documentId}`, handleUpdate);

    return () => {
      leaveActiveDocument(documentId, userId);
      socket.off(titleChangeEvent, handleUpdateTitle);
      socket.off(`document:update:${documentId}`, handleUpdate);
    };
  }, [socket, documentId, user?.id, joinActiveDocument, leaveActiveDocument]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (document === undefined) {
    return <div>Loading...</div>;
  }

  if (document === null) {
    return <div>Not found</div>;
  }

  return (
    <div className="pb-40">
      <div className="h-[35vh]" />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
      </div>
    </div>
  );
};

export default DocumentIdPage;
