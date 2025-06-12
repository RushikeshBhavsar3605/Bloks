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
        this.emitError(
          "join-active-document",
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

  private handleTitleUpdate = ({ documentId, title }: TitleUpdateEvent) => {
    try {
      if (!documentId || typeof title !== "string") {
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
