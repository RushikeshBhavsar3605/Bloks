import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO, Socket } from "socket.io";
import { NextApiResponseServerIo } from "@/types";
import {
  verifyDocumentAccess,
  verifyUserSession,
} from "@/services/socket-service";

export const config = {
  api: {
    bodyParser: false,
  },
};

type DocumentRoomAction = {
  documentId: string;
  userId: string;
};

type TitleUpdateEvent = {
  documentId: string;
  title: string;
};

class SocketDocumentManager {
  private documentRooms = new Set<string>();

  private listeners = {
    join: (data: DocumentRoomAction) => this.joinDocumentRoom(data),
    leave: (data: DocumentRoomAction) => this.leaveDocumentRoom(data),
    titleUpdate: (data: TitleUpdateEvent) => this.handleTitleUpdate(data),
  };

  constructor(
    private socket: Socket,
    private io: ServerIO,
    private userId: string
  ) {
    // Setup listeners with tracked references
    socket.on("join-document", this.listeners.join);
    socket.on("leave-document", this.listeners.leave);
    socket.on("document:update:title", this.listeners.titleUpdate);
  }

  private emitError(event: string, message: string, code: string) {
    this.socket.emit("error", { event, message, code });
  }

  async joinDocumentRoom({
    documentId,
    userId: joinUserId,
  }: DocumentRoomAction) {
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

      if (this.documentRooms.has(documentId)) {
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

      const room = `room:document:${documentId}`;
      this.socket.join(room);
      this.documentRooms.add(documentId);
      console.log(`[Socket.io] User ${this.userId} joined room ${room}`);
    } catch (error) {
      this.emitError(
        "join-document",
        "Failed to join document room",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Join document error:", error);
    }
  }

  leaveDocumentRoom({ documentId, userId: leaveUserId }: DocumentRoomAction) {
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

      if (!this.documentRooms.has(documentId)) {
        this.emitError("leave-document", "Not in document room", "NOT_IN_ROOM");
        return console.warn(`[Socket.io] User is not in room ${documentId}`);
      }

      const room = `room:document:${documentId}`;
      this.socket.leave(room);
      this.documentRooms.delete(documentId);
      console.log(`[Socket.io] User ${this.userId} left room ${room}`);
    } catch (error) {
      this.emitError(
        "leave-document",
        "Failed to leave document room",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Leave document error:", error);
    }
  }

  private handleTitleUpdate({ documentId, title }: TitleUpdateEvent) {
    try {
      if (!documentId || typeof title !== "string") {
        this.emitError(
          "document:update:title",
          "Invalid parameters",
          "INVALID_PARAMETERS"
        );
        return console.warn("[Socket.io] Invalid documentId or title");
      }

      if (!this.documentRooms.has(documentId)) {
        this.emitError(
          "document:update:title",
          "Not in document room",
          "NOT_IN_ROOM"
        );
        return console.warn(`[Socket.io] User not in room ${documentId}`);
      }

      const room = `room:document:${documentId}`;
      const updateTitleEvent = `document:receive:title:${documentId}`;

      this.io.to(room).emit(updateTitleEvent, { documentId, title });
    } catch (error) {
      this.emitError(
        "document:update:title",
        "Failed to update title",
        "INTERNAL_ERROR"
      );
      console.error("[Socket.io] Title update error:", error);
    }
  }

  handleDisconnect() {
    try {
      // Clean up all listeners
      this.socket.off("join-document", this.listeners.join);
      this.socket.off("leave-document", this.listeners.leave);
      this.socket.off("document:update:title", this.listeners.titleUpdate);

      // Clean up rooms
      this.socket.leave(`user:${this.userId}`);
      this.documentRooms.forEach((documentId) => {
        this.io
          .to(`room:document:${documentId}`)
          .emit("user-left", this.userId);
        this.socket.leave(`room:document:${documentId}`);
      });
      this.documentRooms.clear();

      // Clear references
      (this.socket as Socket | null) = null;
      (this.io as any) = null;
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

    io.on("connection", async (socket) => {
      console.log("[Socket.io] Client connected", socket.id);

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
        console.log(`[Socket.io] User ${userId} joined room ${userRoom}`);

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
