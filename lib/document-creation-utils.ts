"use client";

import { toast } from "sonner";

interface CreateDocumentOptions {
  title?: string;
  parentDocumentId?: string;
  content?: string;
  onSuccess?: (document: any) => void;
  onUpgradeRequired?: () => void;
}

export const createDocumentWithUpgradeCheck = async ({
  title = "Untitled",
  parentDocumentId,
  content,
  onSuccess,
  onUpgradeRequired,
}: CreateDocumentOptions) => {
  const promise = fetch("/api/socket/documents", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, parentDocumentId, content }),
  })
    .then(async (res) => {
      const data = await res.json();

      // Check if response contains an error
      if (!res.ok || data.error) {
        // Check if the error message contains "Upgrade required"
        if (data.error && data.error.includes("Upgrade required")) {
          onUpgradeRequired?.();
          throw new Error("Upgrade required");
        }
        throw new Error(data.error || "Failed to create document");
      }

      return data;
    })
    .then((document) => {
      onSuccess?.(document);
      return document;
    });

  toast.promise(promise, {
    loading: "Creating a new note...",
    success: "New note created!",
    error: (err) => {
      // Don't show toast error for upgrade required case
      if (err.message === "Upgrade required") {
        return "You have reached your limit for creating notes. Please upgrade.";
      }
      return "Failed to create a new note.";
    },
  });

  return promise;
};
