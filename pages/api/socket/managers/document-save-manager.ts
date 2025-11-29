import { updateDocument } from "@/services/document-service";
import debounce from "lodash.debounce";

// Simple global document save manager - Map<documentId, debounced save function>
export const DocumentSaveManager = (() => {
  const documentSaveDebounces = new Map<string, ReturnType<typeof debounce>>();
  const pendingDocumentData = new Map<
    string,
    {
      title?: string;
      icon?: string;
      content?: string;
      lastAuthorizedUserId?: string; // Track the latest authorized user
    }
  >();
  let ioInstance: any = null;

  const createDebouncedSave = (documentId: string) => {
    return debounce(async () => {
      const data = pendingDocumentData.get(documentId);
      if (!data || !data.lastAuthorizedUserId) return;

      try {
        const updatePayload: {
          title?: string;
          icon?: string;
          content?: string;
        } = {};
        if (data.title !== undefined)
          updatePayload.title = data.title !== "" ? data.title : "Untitled";
        if (data.icon !== undefined) updatePayload.icon = data.icon;
        if (data.content !== undefined) updatePayload.content = data.content;

        const response = await updateDocument({
          userId: data.lastAuthorizedUserId,
          documentId,
          ...updatePayload,
        });

        if (response.success) {
          // Only clear pending data after successful save
          pendingDocumentData.delete(documentId);

          console.log(
            `[DocumentSaveManager] Save successful for document ${documentId} by user ${data.lastAuthorizedUserId}`
          );

          if (ioInstance) {
            // Only emit save status to the user who made the changes
            ioInstance
              .to(`user:${data.lastAuthorizedUserId}`)
              .emit("save:status", {
                status: "saved",
                documentId: documentId,
              });
          }
        } else {
          console.error(
            `[DocumentSaveManager] Save failed for document ${documentId}: ${response.error} by user ${data.lastAuthorizedUserId}`
          );

          if (ioInstance) {
            // Only emit save status to the user who made the changes
            ioInstance
              .to(`user:${data.lastAuthorizedUserId}`)
              .emit("save:status", {
                status: "error",
                error: response.error,
                documentId: documentId,
              });
          }
        }
      } catch (error) {
        console.error(
          `[DocumentSaveManager] Save error for document ${documentId}:`,
          error
        );

        if (ioInstance) {
          // Only emit save status to the user who made the changes
          ioInstance
            .to(`user:${data.lastAuthorizedUserId}`)
            .emit("save:status", {
              status: "error",
              error: "Failed to save document",
              documentId: documentId,
            });
        }
      }
    }, 2000);
  };

  return {
    setIoInstance: (io: any) => {
      ioInstance = io;
    },

    queueSave: (
      documentId: string,
      userId: string,
      data: { title?: string; icon?: string; content?: string }
    ) => {
      // Get or create debounced save function for this documentId
      if (!documentSaveDebounces.has(documentId)) {
        documentSaveDebounces.set(documentId, createDebouncedSave(documentId));
      }

      // Update pending data with latest changes
      const currentData = pendingDocumentData.get(documentId) || {};
      const updatedData = { ...currentData };

      if (data.title !== undefined) updatedData.title = data.title;
      if (data.icon !== undefined) updatedData.icon = data.icon;
      if (data.content !== undefined) updatedData.content = data.content;

      // Store the latest authorized user who made changes
      updatedData.lastAuthorizedUserId = userId;

      pendingDocumentData.set(documentId, updatedData);

      // Trigger debounced save
      const debouncedSave = documentSaveDebounces.get(documentId)!;
      debouncedSave();
    },

    cleanup: (documentId: string) => {
      documentSaveDebounces.delete(documentId);
      pendingDocumentData.delete(documentId);
      console.log(`[DocumentSaveManager] Cleaned up document ${documentId}`);
    },
  };
})();