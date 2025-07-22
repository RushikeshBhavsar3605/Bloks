import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO, Socket } from "socket.io";
import { NextApiResponseServerIo } from "@/types";
import {
  verifyDocumentAccess,
  verifyUserSession,
} from "@/services/socket-service";
import {
  updateDocument,
  getDirectDocumentAccess,
} from "@/services/document-service";
import debounce from "lodash.debounce";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple global document save manager - Map<documentId, debounced save function>
const DocumentSaveManager = (() => {
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
            ioInstance.to(`user:${data.lastAuthorizedUserId}`).emit("save:status", {
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
            ioInstance.to(`user:${data.lastAuthorizedUserId}`).emit("save:status", {
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
          ioInstance.to(`user:${data.lastAuthorizedUserId}`).emit("save:status", {
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

type DocumentRoomAction = {
  documentId: string;
  userId: string;
};

type TitleUpdateEvent = {
  documentId: string;
  title?: string;
  icon?: string;
};

type ContentUpdateEvent = {
  documentId: string;
  content: string;
  userId: string;
};

class SocketDocumentManager {
  private activeRoom: string | null = null;

  constructor(
    private socket: Socket,
    private io: ServerIO,
    private userId: string
  ) {
    // Sidebar listeners (metadata only)
    socket.on("join-document", this.joinDocumentRoom);
    socket.on("leave-document", this.leaveDocumentRoom);

    // Editor presence listeners (full doc presence)
    socket.on("join-active-document", this.joinActiveRoom);
    socket.on("leave-active-document", this.leaveActiveRoom);

    socket.on("document:update:title", this.handleTitleUpdate);
    socket.on("document:update:content", this.handleContentUpdate);
    socket.on("doc-change", this.handleDocChange);
    socket.on("cursor-update", this.handleCursorUpdate);
    socket.on("collaborator-disconnect", this.handleCollaboratorDisconnect);
  }

  // >------->>-------|----->>----> Sidebar subscription <----<<-----|-------<<-------<

  private joinDocumentRoom = async ({
    documentId,
    userId: joinUserId,
  }: DocumentRoomAction) => {
    try {
      if (joinUserId !== this.userId) {
        this.emitError("join-document", "User ID mismatch", "USER_ID_MISMATCH");
        return console.warn(
          `[Socket.io] User ID mismatch: ${joinUserId} vs ${this.userId}`
        );
      }

      if (!documentId) {
        this.emitError(
          "join-document",
          "Missing document ID",
          "MISSING_DOCUMENT_ID"
        );
        return console.warn(`[Socket.io] Missing documentId for join-document`);
      }

      const room = `room:document:${documentId}`;

      if (this.socket.rooms.has(room)) {
        this.emitError(
          "join-document",
          "Already in document room",
          "ALREADY_IN_ROOM"
        );
        return console.warn(`[Socket.io] User already in room ${documentId}`);
      }

      const documentExists = await verifyDocumentAccess(
        documentId,
        this.userId
      );
      if (!documentExists) {
        this.emitError("join-document", "Unauthorized access", "UNAUTHORIZED");
        return console.warn(
          `[Socket.io] User not authorized to access document`
        );
      }

      this.socket.join(room);
    } catch (error) {
      this.emitError(
        "join-document",
        "Failed to join document room",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Join document error:", error);
    }
  };

  private leaveDocumentRoom = ({
    documentId,
    userId: leaveUserId,
  }: DocumentRoomAction) => {
    try {
      if (leaveUserId !== this.userId) {
        this.emitError(
          "leave-document",
          "User ID mismatch",
          "USER_ID_MISMATCH"
        );
        return console.warn(
          `[Socket.io] User ID mismatch on leave: ${leaveUserId} vs ${this.userId}`
        );
      }

      const room = `room:document:${documentId}`;

      if (!this.socket.rooms.has(room)) {
        this.emitError("leave-document", "Not in document room", "NOT_IN_ROOM");
        return console.warn(`[Socket.io] User is not in room ${documentId}`);
      }

      this.socket.leave(room);
    } catch (error) {
      this.emitError(
        "leave-document",
        "Failed to leave document room",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Leave document error:", error);
    }
  };

  // >------->>-------|----->>----> Editor presence subscription <----<<-----|-------<<-------<

  private joinActiveRoom = async ({
    documentId,
    userId,
  }: DocumentRoomAction) => {
    try {
      if (userId !== this.userId) {
        this.emitError(
          "join-active-document",
          "User ID mismatch",
          "USER_ID_MISMATCH"
        );
        return console.warn(
          `[Socket.io] User ID mismatch: ${userId} vs ${this.userId}`
        );
      }

      if (!documentId) {
        this.emitError(
          "join-active-document",
          "Missing document ID",
          "MISSING_DOCUMENT_ID"
        );
        return console.warn(`[Socket.io] Missing documentId for join-document`);
      }

      if (this.activeRoom === documentId) {
        console.log(
          `[Socket.io] User ${this.userId} already in active room ${documentId}`
        );
        return; // Don't emit error, just return silently
      }

      const documentExists = await verifyDocumentAccess(
        documentId,
        this.userId
      );
      if (!documentExists) {
        this.emitError(
          "join-active-document",
          "Unauthorized access",
          "UNAUTHORIZED"
        );
        return console.warn(
          `[Socket.io] User not authorized to access document`
        );
      }

      const room = `room:active:document:${documentId}`;
      this.socket.join(room);
      this.activeRoom = documentId;

      this.io
        .to(room)
        .emit(`active-users:update`, { documentId, userId, action: "joined" });
      console.log(`[Socket.io] User ${this.userId} joined active room ${room}`);
    } catch (error) {
      this.emitError(
        "join-active-document",
        "Failed to join document room",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Join Active document error:", error);
    }
  };

  private leaveActiveRoom = async ({
    documentId,
    userId,
  }: DocumentRoomAction) => {
    try {
      if (userId !== this.userId) {
        this.emitError(
          "leave-active-document",
          "User ID mismatch",
          "USER_ID_MISMATCH"
        );
        return console.warn(
          `[Socket.io] User ID mismatch on leave: ${userId} vs ${this.userId}`
        );
      }

      if (this.activeRoom !== documentId) {
        this.emitError(
          "leave-active-document",
          "Not in document room",
          "NOT_IN_ROOM"
        );
        return console.warn(`[Socket.io] User is not in room ${documentId}`);
      }

      const room = `room:active:document:${documentId}`;
      this.socket.leave(room);
      this.activeRoom = null;

      // Clean up DocumentSaveManager state when leaving the document
      DocumentSaveManager.cleanup(documentId);

      this.io
        .to(room)
        .emit(`active-users:update`, { documentId, userId, action: "left" });
      console.log(`[Socket.io] User ${this.userId} leave active room ${room}`);
    } catch (error) {
      this.emitError(
        "leave-active-document",
        "Failed to leave document room",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Leave Active document error:", error);
    }
  };

  // >------->>-------|----->>----> Title updates (sidebar) <----<<-----|-------<<-------<

  private handleTitleUpdate = async ({
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

      // Broadcast real-time update to other users
      const updateTitleEvent = `document:receive:title:${documentId}`;
      this.io.to(room).emit(updateTitleEvent, { documentId, title, icon });

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

  private handleContentUpdate = async ({
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

  private handleDocChange = async (data: {
    documentId: string;
    userId: string;
    steps: any[];
    version: number;
    timestamp: number;
  }) => {
    try {
      const { documentId } = data;

      if (!documentId) {
        this.emitError(
          "doc-change",
          "Invalid parameters",
          "INVALID_PARAMETERS"
        );
        return console.warn("[Socket.io] Invalid documentId in doc-change");
      }

      const activeRoom = `room:active:document:${documentId}`;

      // If user is not in active room, try to join them first
      if (!this.socket.rooms.has(activeRoom)) {
        console.warn(
          `[Socket.io] User ${this.userId} not in active room ${documentId}, attempting to join`
        );

        // Try to join the active room
        try {
          const documentExists = await verifyDocumentAccess(
            documentId,
            this.userId
          );
          if (documentExists) {
            this.socket.join(activeRoom);
            this.activeRoom = documentId;
            console.log(
              `[Socket.io] Auto-joined user ${this.userId} to active room ${activeRoom}`
            );
          } else {
            this.emitError("doc-change", "Access denied", "UNAUTHORIZED");
            return console.warn(
              `[Socket.io] User not authorized to access document ${documentId}`
            );
          }
        } catch (error) {
          this.emitError("doc-change", "Failed to join room", "INTERNAL_ERROR");
          return console.error("[Socket.io] Error joining active room:", error);
        }
      }

      // Get all sockets in the room for debugging
      const socketsInRoom = await this.io.in(activeRoom).allSockets();
      console.log(
        `[Socket.io] Broadcasting doc-change from ${this.userId} to ${
          socketsInRoom.size - 1
        } other users in room ${activeRoom}`
      );

      // Broadcast to all other users in the active document room (exclude sender)
      this.socket.to(activeRoom).emit("doc-change", data);
      console.log(
        `[Socket.io] Doc change broadcasted for document ${documentId} with ${data.steps.length} steps`
      );
    } catch (error) {
      this.emitError(
        "doc-change",
        "Failed to broadcast change",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Doc change error:", error);
    }
  };

  // >------->>-------|----->>----> Live Collaboration <----<<-----|-------<<-------<

  private handleCursorUpdate = async (data: {
    documentId: string;
    userId: string;
    userName: string;
    color: string;
    cursor?: number;
    selection?: { from: number; to: number };
    isActive?: boolean;
  }) => {
    try {
      const { documentId } = data;

      if (!documentId) {
        this.emitError(
          "cursor-update",
          "Invalid parameters",
          "INVALID_PARAMETERS"
        );
        return console.warn("[Socket.io] Invalid documentId in cursor-update");
      }

      const activeRoom = `room:active:document:${documentId}`;

      // Ensure user is in the active room
      if (!this.socket.rooms.has(activeRoom)) {
        console.warn(
          `[Socket.io] User ${this.userId} not in active room for cursor update`
        );
        return;
      }

      // Broadcast cursor update to all other users in the active document room
      this.socket.to(activeRoom).emit("cursor-update", data);
      console.log(
        `[Socket.io] Cursor update broadcasted for user ${data.userId} in document ${documentId}`
      );
    } catch (error) {
      this.emitError(
        "cursor-update",
        "Failed to broadcast cursor update",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Cursor update error:", error);
    }
  };

  private handleCollaboratorDisconnect = (data: { userId: string }) => {
    try {
      // Broadcast collaborator disconnect to all active rooms
      if (this.activeRoom) {
        const activeRoom = `room:active:document:${this.activeRoom}`;
        this.socket.to(activeRoom).emit("collaborator-disconnect", data);
        console.log(
          `[Socket.io] Collaborator disconnect broadcasted for user ${data.userId}`
        );
      }
    } catch (error) {
      console.error("[Socket.io] Collaborator disconnect error:", error);
    }
  };

  // >------->>-------|----->>----> Utilities <----<<-----|-------<<-------<

  private emitError(event: string, message: string, code: string) {
    this.socket.emit("error", { event, message, code });
  }

  handleDisconnect() {
    try {
      // Clean up all listeners
      this.socket.off("join-document", this.joinDocumentRoom);
      this.socket.off("leave-document", this.leaveDocumentRoom);

      this.socket.off("join-active-document", this.joinActiveRoom);
      this.socket.off("leave-active-document", this.leaveActiveRoom);

      this.socket.off("document:update:title", this.handleTitleUpdate);
      this.socket.off("document:update:content", this.handleContentUpdate);
      this.socket.off("doc-change", this.handleDocChange);
      this.socket.off("cursor-update", this.handleCursorUpdate);
      this.socket.off(
        "collaborator-disconnect",
        this.handleCollaboratorDisconnect
      );

      // Clean up DocumentSaveManager state if user was in an active document
      if (this.activeRoom) {
        DocumentSaveManager.cleanup(this.activeRoom);
      }

      // Clean up rooms
      this.socket.leave(`user:${this.userId}`);
      this.activeRoom = null;
    } catch (error) {
      console.error("[Socket.io] Disconnect cleanup error:", error);
    }
  }
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer = res.socket.server as NetServer & { io?: ServerIO };

    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });

    // Set the io instance for DocumentSaveManager
    DocumentSaveManager.setIoInstance(io);

    io.on("connection", async (socket) => {
      try {
        const userId = socket.handshake.query.userId as string;
        const isValid = await verifyUserSession(userId);
        if (!isValid) {
          socket.emit("error", {
            event: "connection",
            message: "Invalid session",
            code: "INVALID_SESSION",
          });
          socket.disconnect(true);
          return console.warn(`[Socket.io] Connection without userId`);
        }

        // Join user's personal room
        const userRoom = `user:${userId}`;
        socket.join(userRoom);

        // Initialize document room manager
        const documentManager = new SocketDocumentManager(socket, io, userId);

        socket.on("disconnect", () => {
          documentManager.handleDisconnect();
          console.log("[Socket.io] Client disconnected", socket.id);
        });
      } catch (error) {
        socket.emit("error", {
          event: "connection",
          message: "Connection failed",
          code: "CONNECTION_ERROR",
        });
        socket.disconnect(true);
        console.error("[Socket.io] Connection error:", error);
      }
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
