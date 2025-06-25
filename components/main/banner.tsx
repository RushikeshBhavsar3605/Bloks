"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ConfirmModal } from "../modals/confirm-modal";

interface BannerProps {
  documentId: string;
  documentTitle: string;
  isOwner: boolean;
}

export const Banner = ({ documentId, documentTitle, isOwner }: BannerProps) => {
  const router = useRouter();

  const onRestore = () => {
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

  const onRemove = () => {
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

    router.replace("/documents");
  };

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>This page is in the Trash.</p>

      {isOwner && (
        <>
          <Button
            size="sm"
            onClick={onRestore}
            variant="outline"
            className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
          >
            Restore page
          </Button>

          <ConfirmModal
            onConfirm={onRemove}
            title="Permanently Delete Document?"
            description={
              <>
                This action is irreversible.
                <br />
                The document{" "}
                <span className="text-red-500 dark:text-red-400 font-medium">
                  {documentTitle} (ID: {documentId})
                </span>{" "}
                will be:
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    Immediately removed from all collaborators&apos;s access
                  </li>
                  <li className="text-red-500 dark:text-red-400">
                    Permanently deleted from our servers
                  </li>
                  <li>Cannot be recovered through support or backups</li>
                </ul>
              </>
            }
          >
            <Button
              size="sm"
              variant="outline"
              className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
            >
              Delete forever
            </Button>
          </ConfirmModal>
        </>
      )}
    </div>
  );
};
