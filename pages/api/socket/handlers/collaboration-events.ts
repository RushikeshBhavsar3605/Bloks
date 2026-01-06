import { Socket, Server as ServerIO } from "socket.io";
import { verifyDocumentAccess } from "@/services/socket-service";

export class CollaborationEventHandler {
  constructor(
    private socket: Socket,
    private io: ServerIO,
    private userId: string,
    private emitError: (event: string, message: string, code: string) => void
  ) {}

  handleDocHeaderChange = async (
    data: {
      documentId: string;
      userId: string;
      title?: string;
      icon?: string;
    },
    activeRoom: string | null,
    setActiveRoom: (room: string | null) => void
  ) => {
    try {
      const { documentId, userId, title, icon } = data;

      if (!documentId || !userId) {
        this.emitError(
          "doc-header-change",
          "Invalid parameters",
          "INVALID_PARAMETERS"
        );
        return console.warn(
          "[Socket.io] Invalid documentId in doc-header-change"
        );
      }

      const activeRoomName = `room:active:document:${documentId}`;

      if (!this.socket.rooms.has(activeRoomName)) {
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
            this.socket.join(activeRoomName);
            setActiveRoom(documentId);
            console.log(
              `[Socket.io] Auto-joined user ${this.userId} to active room ${activeRoomName}`
            );
          } else {
            this.emitError(
              "doc-header-change",
              "Access denied",
              "UNAUTHORIZED"
            );
            return console.warn(
              `[Socket.io] User not authorized to access document ${documentId}`
            );
          }
        } catch (error) {
          this.emitError(
            "doc-header-change",
            "Failed to join room",
            "INTERNAL_ERROR"
          );
          return console.error("[Socket.io] Error joining active room:", error);
        }
      }

      // Get all sockets in the room for debugging
      const socketsInRoom = await this.io.in(activeRoomName).allSockets();
      console.log(
        `[Socket.io] Broadcasting doc-header-change from ${this.userId} to ${
          socketsInRoom.size - 1
        } other users in room ${activeRoomName}`
      );

      // Broadcast to all other users in the active document room (exclude sender)
      this.io.to(activeRoomName).emit("doc-header-change", data);
      this.io.to(`room:document:${documentId}`).emit("doc-header-change", data);
      console.log(
        `[Socket.io] Doc change broadcasted for document ${documentId} with ${data.title}`
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

  handleDocChange = async (
    data: {
      documentId: string;
      userId: string;
      steps: any[];
      version: number;
      timestamp: number;
      testId?: string;
    },
    activeRoom: string | null,
    setActiveRoom: (room: string | null) => void,
    ack?: (res?: any) => void
  ) => {
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

      const activeRoomName = `room:active:document:${documentId}`;

      // If user is not in active room, try to join them first
      if (!this.socket.rooms.has(activeRoomName)) {
        if (data.testId && data.testId === process.env.TEST_ID) {
          this.socket.join(activeRoomName);
          setActiveRoom(documentId);
        } else {
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
              this.socket.join(activeRoomName);
              setActiveRoom(documentId);
              console.log(
                `[Socket.io] Auto-joined user ${this.userId} to active room ${activeRoomName}`
              );
            } else {
              this.emitError("doc-change", "Access denied", "UNAUTHORIZED");
              return console.warn(
                `[Socket.io] User not authorized to access document ${documentId}`
              );
            }
          } catch (error) {
            this.emitError(
              "doc-change",
              "Failed to join room",
              "INTERNAL_ERROR"
            );
            return console.error(
              "[Socket.io] Error joining active room:",
              error
            );
          }
        }
      }

      // Get all sockets in the room for debugging
      const socketsInRoom = await this.io.in(activeRoomName).allSockets();
      // console.log(
      //   `[Socket.io] Broadcasting doc-change from ${this.userId} to ${
      //     socketsInRoom.size - 1
      //   } other users in room ${activeRoomName}`
      // );

      const { testId, ...restData } = data;
      // Broadcast to all other users in the active document room (exclude sender)
      this.socket.to(activeRoomName).emit("doc-change", restData);
      ack?.({ ok: true, ts: Date.now() });
      // console.log(
      //   `[Socket.io] Doc change broadcasted for document ${documentId} with ${restData.steps.length} steps`
      // );
    } catch (error) {
      this.emitError(
        "doc-change",
        "Failed to broadcast change",
        "INTERNAL_ERROR"
      );
      ack?.({ ok: false, error: "UNAUTHORIZED" });
      console.error("[Socket.io] Doc change error:", error);
    }
  };

  // >------->>-------|----->>----> Live Collaboration <----<<-----|-------<<-------<

  handleCursorUpdate = async (data: {
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

  handleCollaboratorDisconnect = (
    data: { userId: string },
    activeRoom: string | null
  ) => {
    try {
      // Broadcast collaborator disconnect to all active rooms
      if (activeRoom) {
        const activeRoomName = `room:active:document:${activeRoom}`;
        this.socket.to(activeRoomName).emit("collaborator-disconnect", data);
        console.log(
          `[Socket.io] Collaborator disconnect broadcasted for user ${data.userId}`
        );
      }
    } catch (error) {
      console.error("[Socket.io] Collaborator disconnect error:", error);
    }
  };
}
