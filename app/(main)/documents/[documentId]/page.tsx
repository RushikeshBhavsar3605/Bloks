"use client";

import { Editor } from "@/components/main/editor";
import { Toolbar } from "@/components/main/toolbar";
import { FormattingToolbar } from "@/components/main/formatting-toolbar";
import { useSocket } from "@/components/providers/socket-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DocumentWithMeta } from "@/types/shared";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const DocumentIdPage = () => {
  const user = useCurrentUser();
  const { socket, joinActiveDocument, leaveActiveDocument } = useSocket();
  const params = useParams();
  const router = useRouter();
  const documentId = params?.documentId as string;
  const [document, setDocument] = useState<DocumentWithMeta>();
  const [editor, setEditor] = useState<any>(null);

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

    const handleDocHeaderChange = ({
      documentId,
      userId,
      title,
      icon,
    }: {
      documentId: string;
      userId: string;
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

    const handleCollaboratorRoleChange = ({
      documentId: eventDocumentId,
      updatedUser,
      newRole,
    }: {
      documentId: string;
      updatedUser: { id: string; name: string };
      newRole: string;
    }) => {
      // Only update if this event is for the current document and current user
      if (eventDocumentId === documentId && updatedUser.id === userId) {
        setDocument((doc) => {
          if (!doc) return doc;
          return {
            ...doc,
            role: newRole as any,
            isOwner: newRole === "OWNER" ? true : doc.isOwner,
          };
        });

        // Show toast notification about role change
        toast.success(
          `Your access level has been changed to ${newRole.toLowerCase()}`
        );
      }
    };

    const docHeaderChange = `doc-header-change`;

    console.log(
      `[PAGE] Joining active document: ${documentId} for user: ${userId}`
    );
    joinActiveDocument(documentId, userId);
    socket.on(docHeaderChange, handleDocHeaderChange);
    socket.on("collaborator:settings:role", handleCollaboratorRoleChange);

    return () => {
      console.log(
        `[PAGE] Leaving active document: ${documentId} for user: ${userId}`
      );
      leaveActiveDocument(documentId, userId);
      socket.off(docHeaderChange, handleDocHeaderChange);
      socket.off("collaborator:settings:role", handleCollaboratorRoleChange);
    };
  }, [socket, documentId, user?.id, joinActiveDocument, leaveActiveDocument]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (document === undefined) {
    return (
      <div>
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-28">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (document === null) {
    return <div>Not found</div>;
  }

  // Determine if user can edit based on role
  const canEdit = document.isOwner || document.role === "EDITOR";

  return (
    <TooltipProvider>
      <div className="pb-40 dark:bg-[#0B0B0F]">
        <div className="h-[66px]" />

        {/* New Structure: Formatting Toolbar -> Document Toolbar -> Editor */}
        {editor && (
          <FormattingToolbar
            editor={editor}
            editable={canEdit}
            userId={user?.id as string}
            documentId={documentId}
          />
        )}

        <div className="mx-auto">
          <Toolbar initialData={document} preview={!canEdit} />
          <Editor
            onChange={() => {}}
            initialContent={document.content ?? undefined}
            documentId={documentId}
            editable={canEdit}
            onEditorReady={setEditor}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DocumentIdPage;
