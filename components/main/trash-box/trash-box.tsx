"use client";

import { Document } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import { DocumentWithMeta } from "@/types/shared";
import { useCurrentUser } from "@/hooks/use-current-user";
import { TrashSearch } from "./trash-search";
import { TrashDocumentSection } from "./trash-document-section";

type ModifiedDocument = {
  ownedArchived: DocumentWithMeta[];
  sharedArchived: DocumentWithMeta[];
};

export const TrashBox = () => {
  const router = useRouter();
  const params = useParams();
  const user = useCurrentUser();

  const [search, setSearch] = useState<string>("");
  const [documents, setDocuments] = useState<ModifiedDocument>();

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const onRestore = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: string
  ) => {
    event.stopPropagation();
    const promise = fetch(`/api/socket/documents/${documentId}/restore`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored!",
      error: "Failed to restore note.",
    });
  };

  const onRemove = (documentId: string) => {
    const promise = fetch(`/api/socket/documents/${documentId}/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted!",
      error: "Failed to delete note.",
    });

    if (params?.documentId === documentId) {
      router.push("/documents");
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/socket/documents/trash");
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.log("Failed to fetch trash documents", error);
    }
  };

  const handleRestore = (data: {
    restoredDocument: Document;
    restoredIds: string[];
  }) => {
    const restoredIdsSet = new Set(data.restoredIds);

    setDocuments((prevDocs) => {
      if (!prevDocs) return prevDocs;

      return {
        ...prevDocs,
        ownedArchived: prevDocs?.ownedArchived.filter(
          (doc) => !restoredIdsSet.has(doc.id)
        ),
        sharedArchived: prevDocs?.sharedArchived.filter(
          (doc) => !restoredIdsSet.has(doc.id)
        ),
      };
    });
  };

  const handleRemove = (data: { removedIds: string[] }) => {
    const removedIdsSet = new Set(data.removedIds);

    setDocuments((prevDocs) => {
      if (!prevDocs) return prevDocs;

      return {
        ...prevDocs,
        ownedArchived: prevDocs?.ownedArchived.filter(
          (doc) => !removedIdsSet.has(doc.id)
        ),
        sharedArchived: prevDocs?.sharedArchived.filter(
          (doc) => !removedIdsSet.has(doc.id)
        ),
      };
    });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredOwnedDocuments = documents?.ownedArchived.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase());
  });

  const filteredSharedDocuments = documents?.sharedArchived.filter(
    (document) => {
      return document.title.toLowerCase().includes(search.toLowerCase());
    }
  );

  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm max-h-[80vh] flex flex-col">
      {/*Search Header*/}
      <TrashSearch search={search} setSearch={setSearch} />

      {/*Scrollable Content*/}
      <div className="overflow-y-auto mt-2 px-1 pb-1">
        {/* Empty state message */}
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </p>

        {/* Private Documents Section */}
        {filteredOwnedDocuments && filteredOwnedDocuments?.length > 0 && (
          <TrashDocumentSection
            label="Private Documents"
            documents={filteredOwnedDocuments}
            onClick={onClick}
            onRestore={onRestore}
            onRemove={onRemove}
            handleRestore={handleRestore}
            handleRemove={handleRemove}
          />
        )}

        {/* Shared Documents Section */}
        {filteredSharedDocuments && filteredSharedDocuments.length > 0 && (
          <TrashDocumentSection
            label="Shared Documents"
            documents={filteredSharedDocuments}
            onClick={onClick}
            onRestore={onRestore}
            onRemove={onRemove}
            handleRestore={handleRestore}
            handleRemove={handleRemove}
          />
        )}
      </div>
    </div>
  );
};
