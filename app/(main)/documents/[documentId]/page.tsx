"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const DocumentIdPage = () => {
  const user = useCurrentUser();
  const { socket, joinActiveDocument, leaveActiveDocument } = useSocket();
  const params = useParams();
  const documentId = params?.documentId as string;

  useEffect(() => {
    const userId = user?.id;

    if (!documentId || !userId) return;

    joinActiveDocument(documentId, userId);

    return () => {
      leaveActiveDocument(documentId, userId);
    };
  }, [socket, documentId, user?.id, joinActiveDocument, leaveActiveDocument]);

  return <div>DocumentId</div>;
};

export default DocumentIdPage;
