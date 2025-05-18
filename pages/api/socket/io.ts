import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
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

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;

    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });

    io.on("connection", async (socket) => {
      console.log("[Socket.io] Client connected", socket.id);

      const userId = socket.handshake.query.userId as string;
      const isValid = await verifyUserSession(userId);

      if (!isValid) {
        socket.disconnect(true);
        console.warn(`[Socket.io] Connection without userId`);
        return;
      }

      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      console.log(`[Socket.io] User ${userId} joined room ${userRoom}`);

      // Document Room Manager
      const documentRooms = new Set<string>();

      // Join a document room
      const joinDocumentRoom = async ({
        documentId,
        userId: joinUserId,
      }: {
        documentId: string;
        userId: string;
      }) => {
        if (joinUserId !== userId) {
          console.warn(
            `[Socket.io] User ID mismatch: ${joinUserId} vs ${userId}`
          );
          return;
        }

        if (!documentId) {
          console.warn(`[Socket.io] Missing documentId for join-document`);
          return;
        }

        if (documentRooms.has(documentId)) {
          console.warn(`[Socket.io] User already in room ${documentId}`);
          return;
        }

        const documentExists = await verifyDocumentAccess(documentId, userId);
        if (!documentExists) {
          console.warn(`[Socket.io] User not authorized to access document`);
          return;
        }

        const room = `room:document:${documentId}`;
        socket.join(room);
        documentRooms.add(documentId);
        console.log(`[Socket.io] User ${userId} joined room ${room}`);
      };

      // Leave a document room
      const leaveDocumentRoom = async ({
        documentId,
        userId: leaveUserId,
      }: {
        documentId: string;
        userId: string;
      }) => {
        if (!documentRooms.has(documentId)) {
          console.warn(`[Socket.io] User is not in room ${documentId}`);
          return;
        }

        const room = `room:document:${documentId}`;
        socket.leave(room);
        documentRooms.delete(documentId);
        console.log(`[Socket.io] User ${userId} left room ${room}`);
      };

      socket.on("join-document", joinDocumentRoom);
      socket.on("leave-document", leaveDocumentRoom);

      // Handle document title update
      socket.on("document:update:title", ({ documentId, title }) => {
        if (!documentId || typeof title !== "string") {
          console.warn("[Socket.io] Invalid documentId or title");
          return;
        }

        const room = `room:document:${documentId}`;
        const updateTitleEvent = `document:receive:title:${documentId}`;

        io.to(room).emit(updateTitleEvent, {
          documentId,
          title,
        });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        documentRooms.forEach((documentId) => {
          io.to(`room:document:${documentId}`).emit("user-left", userId);
        });
        documentRooms.clear();
        console.log("[Socket.io] Client disconnected", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
