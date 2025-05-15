"use client";

import { CollaboratorRole, Document } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../spinner";
import { Search, Trash, Undo } from "lucide-react";
import { Input } from "../ui/input";
import { ConfirmModal } from "../modals/confirm-modal";
import { useSocket } from "../providers/socket-provider";
import { DocumentWithMeta } from "@/types/shared";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Separator } from "../ui/separator";

type ModifiedDocument = {
  ownedArchived: DocumentWithMeta[];
  sharedArchived: DocumentWithMeta[];
};

export const TrashBox = () => {
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();
  const user = useCurrentUser();

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
    <div className="text-sm max-h-[80vh] flex flex-col">
      {/* Search Header */}
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
        />
      </div>

      {/*Scrollable Content*/}
      <div className="overflow-y-auto mt-2 px-1 pb-1">
        {/* Empty state message */}
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </p>

        {/* Private Documents Section */}
        {filteredOwnedDocuments && filteredOwnedDocuments?.length > 0 && (
          <div className="mb-4">
            <div className="text-gray-700 dark:text-gray-400 text-sm font-medium px-2 py-2">
              Private Documents
            </div>
            <Separator className="mx-2 w-auto h-[1.5px]" />
            {filteredOwnedDocuments?.map((document) => (
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

                  <ConfirmModal
                    onConfirm={() => onRemove(document.id)}
                    title="Permanently Delete Document?"
                    description={
                      <>
                        This action is irreversible.
                        <br />
                        The document{" "}
                        <span className="text-red-500 dark:text-red-400 font-medium">
                          {document.title} (ID: {document.id})
                        </span>{" "}
                        will be:
                        <ul className="list-disc pl-6 mt-1">
                          <li>
                            Immediately removed from all collaborators&apos;s
                            access
                          </li>
                          <li className="text-red-500 dark:text-red-400">
                            Permanently deleted from our servers
                          </li>
                          <li>
                            Cannot be recovered through support or backups
                          </li>
                        </ul>
                      </>
                    }
                  >
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
        )}

        {/* Shared Documents Section */}
        {filteredSharedDocuments && filteredSharedDocuments.length > 0 && (
          <div>
            <div className="text-gray-700 dark:text-gray-400 text-sm font-medium px-2 py-2">
              Shared
            </div>
            <Separator className="mx-2 w-auto h-[1.5px]" />
            {filteredSharedDocuments?.map((document) => (
              <div
                key={document.id}
                role="button"
                onClick={() => onClick(document.id)}
                className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
              >
                <span className="truncate pl-2">{document.title}</span>

                <div className="flex items-center">
                  {(document.userId === user?.id ||
                    document.role === CollaboratorRole.EDITOR) && (
                    <div
                      onClick={(e) => onRestore(e, document.id)}
                      role="button"
                      className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    >
                      <Undo className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  {document.userId === user?.id && (
                    <ConfirmModal
                      onConfirm={() => onRemove(document.id)}
                      title="Permanently Delete Document?"
                      description={
                        <>
                          This action is irreversible.
                          <br />
                          The document{" "}
                          <span className="text-red-500 dark:text-red-400 font-medium">
                            {document.title} (ID: {document.id})
                          </span>{" "}
                          will be:
                          <ul className="list-disc pl-6 mt-1">
                            <li>
                              Immediately removed from all collaborators&apos;s
                              access
                            </li>
                            <li className="text-red-500 dark:text-red-400">
                              Permanently deleted from our servers
                            </li>
                            <li>
                              Cannot be recovered through support or backups
                            </li>
                          </ul>
                        </>
                      }
                    >
                      <div
                        role="button"
                        className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      >
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </ConfirmModal>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
