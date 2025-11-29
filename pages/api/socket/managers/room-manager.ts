import { Socket, Server as ServerIO } from "socket.io";
import { verifyDocumentAccess } from "@/services/socket-service";
import { DocumentSaveManager } from "./document-save-manager";
import { DocumentRoomAction } from "../types";

export class RoomManager {
  constructor(
    private socket: Socket,
    private io: ServerIO,
    private userId: string,
    private emitError: (event: string, message: string, code: string) => void
  ) {}

  // >------->>-------|----->>----> Sidebar subscription <----<<-----|-------<<-------<

  joinDocumentRoom = async ({
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

  leaveDocumentRoom = ({
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

  joinActiveRoom = async (
    { documentId, userId }: DocumentRoomAction,
    activeRoom: string | null,
    setActiveRoom: (room: string | null) => void
  ) => {
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

      if (activeRoom === documentId) {
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
      setActiveRoom(documentId);

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

  leaveActiveRoom = async (
    { documentId, userId }: DocumentRoomAction,
    activeRoom: string | null,
    setActiveRoom: (room: string | null) => void
  ) => {
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

      if (activeRoom !== documentId) {
        this.emitError(
          "leave-active-document",
          "Not in document room",
          "NOT_IN_ROOM"
        );
        return console.warn(`[Socket.io] User is not in room ${documentId}`);
      }

      const room = `room:active:document:${documentId}`;
      this.socket.leave(room);
      setActiveRoom(null);

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
}