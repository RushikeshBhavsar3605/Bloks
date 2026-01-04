import { Socket, Server as ServerIO } from "socket.io";
import { RoomManager } from "./managers/room-manager";
import { DocumentEventHandler } from "./handlers/document-events";
import { CollaborationEventHandler } from "./handlers/collaboration-events";
import { DocumentSaveManager } from "./managers/document-save-manager";
import { DocumentRoomAction } from "./types";
import { setEditEventCount, setEditLatencies } from "./io";
import { performance } from "perf_hooks";

export class SocketDocumentManager {
  private activeRoom: string | null = null;
  private roomManager: RoomManager;
  private documentHandler: DocumentEventHandler;
  private collaborationHandler: CollaborationEventHandler;

  constructor(
    private socket: Socket,
    private io: ServerIO,
    private userId: string
  ) {
    // Initialize handlers
    this.roomManager = new RoomManager(
      socket,
      io,
      userId,
      this.emitError.bind(this)
    );
    this.documentHandler = new DocumentEventHandler(
      socket,
      io,
      userId,
      this.emitError.bind(this)
    );
    this.collaborationHandler = new CollaborationEventHandler(
      socket,
      io,
      userId,
      this.emitError.bind(this)
    );

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Sidebar listeners (metadata only)
    this.socket.on("join-document", this.roomManager.joinDocumentRoom);
    this.socket.on("leave-document", this.roomManager.leaveDocumentRoom);

    // Editor presence listeners (full doc presence)
    this.socket.on("join-active-document", this.handleJoinActiveDocument);
    this.socket.on("leave-active-document", this.handleLeaveActiveDocument);

    // Document event listeners
    this.socket.on(
      "document:update:title",
      this.documentHandler.handleTitleUpdate
    );
    this.socket.on(
      "document:update:content",
      this.documentHandler.handleContentUpdate
    );

    // Collaboration event listeners
    this.socket.on("doc-header-change", this.handleDocHeaderChange);
    this.socket.on("doc-change", this.handleDocChange);
    this.socket.on(
      "cursor-update",
      this.collaborationHandler.handleCursorUpdate
    );
    this.socket.on(
      "collaborator-disconnect",
      this.handleCollaboratorDisconnect
    );
  }

  // Wrapper methods to handle activeRoom state
  private handleJoinActiveDocument = (data: DocumentRoomAction) => {
    this.roomManager.joinActiveRoom(
      data,
      this.activeRoom,
      this.setActiveRoom.bind(this)
    );
  };

  private handleLeaveActiveDocument = (data: DocumentRoomAction) => {
    this.roomManager.leaveActiveRoom(
      data,
      this.activeRoom,
      this.setActiveRoom.bind(this)
    );
  };

  private handleDocHeaderChange = (data: {
    documentId: string;
    userId: string;
    title?: string;
    icon?: string;
  }) => {
    this.collaborationHandler.handleDocHeaderChange(
      data,
      this.activeRoom,
      this.setActiveRoom.bind(this)
    );
  };

  private handleDocChange = async (data: {
    documentId: string;
    userId: string;
    steps: any[];
    version: number;
    timestamp: number;
  }) => {
    // Latency Calculation
    const start = performance.now();

    await this.collaborationHandler.handleDocChange(
      data,
      this.activeRoom,
      this.setActiveRoom.bind(this)
    );

    const duration = performance.now() - start;
    setEditLatencies(duration);
    setEditEventCount();
  };

  private handleCollaboratorDisconnect = (data: { userId: string }) => {
    this.collaborationHandler.handleCollaboratorDisconnect(
      data,
      this.activeRoom
    );
  };

  private setActiveRoom(room: string | null) {
    this.activeRoom = room;
  }

  private emitError(event: string, message: string, code: string) {
    this.socket.emit("error", { event, message, code });
  }

  handleDisconnect() {
    try {
      // Clean up all listeners
      this.socket.off("join-document", this.roomManager.joinDocumentRoom);
      this.socket.off("leave-document", this.roomManager.leaveDocumentRoom);

      this.socket.off("join-active-document", this.handleJoinActiveDocument);
      this.socket.off("leave-active-document", this.handleLeaveActiveDocument);

      this.socket.off(
        "document:update:title",
        this.documentHandler.handleTitleUpdate
      );
      this.socket.off(
        "document:update:content",
        this.documentHandler.handleContentUpdate
      );
      this.socket.off("doc-header-change", this.handleDocHeaderChange);
      this.socket.off("doc-change", this.handleDocChange);
      this.socket.off(
        "cursor-update",
        this.collaborationHandler.handleCursorUpdate
      );
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
