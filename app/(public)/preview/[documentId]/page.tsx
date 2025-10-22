"use client";

import { Editor } from "@/components/main/editor";
import { Toolbar } from "@/components/main/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getPreviewDocument } from "@/actions/documents/get-preview-document";
import { DocumentWithMeta } from "@/types/shared";

const DocumentIdPage = () => {
  const params = useParams();
  const router = useRouter();
  const documentId = params?.documentId as string;
  const [document, setDocument] = useState<DocumentWithMeta | null>();
  const [editor, setEditor] = useState<any>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      if (!documentId) {
        return router.push("/documents");
      }

      const data = await getPreviewDocument(documentId);

      setDocument(data);
    } catch (error) {
      console.error("Failed to fetch document:", error);
      toast.error("Failed to load document");
      router.push("/documents");
    }
  }, [documentId, router]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (document === null) {
    return <div>Not found</div>;
  }

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

  // Determine if user can edit based on role
  const canEdit = false;

  return (
    <TooltipProvider>
      <div className="pb-40 dark:bg-[#0B0B0F]">
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
