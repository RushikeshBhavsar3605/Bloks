import { Socket, Server as ServerIO } from "socket.io";
import { getDirectDocumentAccess } from "@/services/document-service";
import { DocumentSaveManager } from "../managers/document-save-manager";
import { TitleUpdateEvent, ContentUpdateEvent } from "../types";

export class DocumentEventHandler {
  constructor(
    private socket: Socket,
    private io: ServerIO,
    private userId: string,
    private emitError: (event: string, message: string, code: string) => void
  ) {}

  // >------->>-------|----->>----> Title updates (sidebar) <----<<-----|-------<<-------<

  handleTitleUpdate = async ({
    documentId,
    title,
    icon,
  }: TitleUpdateEvent) => {
    try {
      if (!documentId) {
        this.emitError(
          "document:update:title",
          "Invalid parameters",
          "INVALID_PARAMETERS"
        );
        return console.warn("[Socket.io] Invalid documentId or title");
      }

      const room = `room:document:${documentId}`;

      if (!this.socket.rooms.has(room)) {
        this.emitError(
          "document:update:title",
          "Not in document room",
          "NOT_IN_ROOM"
        );
        return console.warn(`[Socket.io] User not in room ${documentId}`);
      }

      // Check if user is authorized to save first
      const accessResult = await getDirectDocumentAccess(
        documentId,
        this.userId
      );

      if (!accessResult.success || !accessResult.data?.hasAccess) {
        console.warn(
          `[Socket.io] User ${this.userId} has no access to document ${documentId}`
        );
        return;
      }

      const role = accessResult.data.role;
      const isOwner = accessResult.data.isOwner;

      if (!isOwner && role !== "EDITOR") {
        console.warn(
          `[Socket.io] User ${this.userId} (${role}) has no write permission for document ${documentId}`
        );
        return;
      }

      // Queue debounced save using the global document manager
      DocumentSaveManager.queueSave(documentId, this.userId, { title, icon });

      // Emit saving status immediately
      this.io.to(`user:${this.userId}`).emit("save:status", {
        status: "saving",
        documentId: documentId,
      });
    } catch (error) {
      this.emitError(
        "document:update:title",
        "Failed to update title",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Title update error:", error);
    }
  };

  handleContentUpdate = async ({
    documentId,
    content,
    userId,
  }: ContentUpdateEvent) => {
    try {
      if (!documentId || content === undefined || !userId) {
        this.emitError(
          "document:update:content",
          "Invalid parameters",
          "INVALID_PARAMETERS"
        );
        return console.warn(
          "[Socket.io] Invalid documentId, content, or userId"
        );
      }

      // Verify the userId matches the socket's userId for security
      if (userId !== this.userId) {
        this.emitError(
          "document:update:content",
          "User ID mismatch",
          "USER_ID_MISMATCH"
        );
        return console.warn(
          `[Socket.io] User ID mismatch: ${userId} vs ${this.userId}`
        );
      }

      console.log(`[USER ID FROM CONTENT UPDATE]: ${userId}`);
      console.log(`[SOCKET OWNER]: ${this.userId}`);

      const room = `room:document:${documentId}`;

      if (!this.socket.rooms.has(room)) {
        this.emitError(
          "document:update:content",
          "Not in document room",
          "NOT_IN_ROOM"
        );
        return console.warn(`[Socket.io] User not in room ${documentId}`);
      }

      // Check if user is authorized to save first
      const accessResult = await getDirectDocumentAccess(documentId, userId);

      if (!accessResult.success || !accessResult.data?.hasAccess) {
        console.warn(
          `[Socket.io] User ${userId} has no access to document ${documentId}`
        );
        return;
      }

      const role = accessResult.data.role;
      const isOwner = accessResult.data.isOwner;

      if (!isOwner && role !== "EDITOR") {
        console.warn(
          `[Socket.io] User ${userId} (${role}) has no write permission for document ${documentId}`
        );
        return;
      }

      // Queue debounced save using the global document manager
      DocumentSaveManager.queueSave(documentId, userId, { content });

      // Emit saving status immediately
      this.io.to(`user:${userId}`).emit("save:status", {
        status: "saving",
        documentId: documentId,
      });
    } catch (error) {
      this.emitError(
        "document:update:content",
        "Failed to update content",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Content update error:", error);
    }
  };
}