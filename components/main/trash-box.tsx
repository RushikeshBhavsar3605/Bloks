"use client";

import { Document } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../spinner";
import { Search, Trash, Undo } from "lucide-react";
import { Input } from "../ui/input";
import { ConfirmModal } from "../modals/confirm-modal";
import { useSocket } from "../providers/socket-provider";
import { DocumentWithMeta } from "@/types/shared";

type ModifiedDocument = {
  ownedArchived: DocumentWithMeta[];
  sharedArchived: DocumentWithMeta[];
};

export const TrashBox = () => {
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();

  const [search, setSearch] = useState<string>("");
  const [documents, setDocuments] = useState<ModifiedDocument>();

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/socket/documents/trash");
      const data = await res.json();
      setDocuments(data);
      console.log("DOC: ", JSON.stringify(data));
    } catch (error) {
      console.log("Failed to fetch trash documents", error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleRestore = (data: Document) => {
      fetchDocuments();
    };

    const handleRemove = (data: Document) => {
      fetchDocuments();
    };

    socket.on("document:restore", handleRestore);
    socket.on("document:remove", handleRemove);

    return () => {
      socket.off("document:restore", handleRestore);
      socket.off("document:remove", handleRemove);
    };
  }, [socket]);

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

  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
        />
      </div>

      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </p>

        {filteredOwnedDocuments &&
          filteredOwnedDocuments?.length > 0 &&
          filteredOwnedDocuments?.map((document) => (
            <div
              key={document.id}
              role="button"
              onClick={() => onClick(document.id)}
              className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
            >
              <span className="truncate pl-2">{document.title}</span>

              <div className="flex items-center">
                <div
                  onClick={(e) => onRestore(e, document.id)}
                  role="button"
                  className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                >
                  <Undo className="h-4 w-4 text-muted-foreground" />
                </div>

                <ConfirmModal onConfirm={() => onRemove(document.id)}>
                  <div
                    role="button"
                    className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                  >
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </div>
                </ConfirmModal>
              </div>
            </div>
          ))}

        {filteredSharedDocuments &&
          filteredSharedDocuments.length > 0 &&
          filteredSharedDocuments?.map((document) => (
            <div
              key={document.id}
              role="button"
              onClick={() => onClick(document.id)}
              className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
            >
              <span className="truncate pl-2">{document.title}</span>

              <div className="flex items-center">
                <div
                  onClick={(e) => onRestore(e, document.id)}
                  role="button"
                  className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                >
                  <Undo className="h-4 w-4 text-muted-foreground" />
                </div>

                <ConfirmModal onConfirm={() => onRemove(document.id)}>
                  <div
                    role="button"
                    className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                  >
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </div>
                </ConfirmModal>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
