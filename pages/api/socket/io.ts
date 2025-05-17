import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types";

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

    io.on("connection", (socket) => {
      console.log("[Socket.io] Client connected", socket.id);

      const userId = socket.handshake.query.userId;
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.io] User ${userId} joined room user:${userId}`);
      }

      // Join a document room
      socket.on("join-document", ({ documentId, userId }) => {
        if (documentId === "cma48ixzo000b23o8jur2iz58") {
          console.log("User: ", userId);
        }
        const room = `room:document:${documentId}`;
        socket.join(room);
        console.log(`[Socket.io] User ${userId} joined room ${room}`);
      });

      // Leave a document room
      socket.on("leave-document", ({ documentId, userId }) => {
        const room = `room:document:${documentId}`;
        socket.leave(room);
        console.log(`[Socket.io] User ${userId} left room ${room}`);
      });

      // Handle document title update
      socket.on(
        "document:update:title",
        ({ documentId, parentDocumentId, title }) => {
          let parentRoom;
          let updateTitleEvent;
          if (parentDocumentId) {
            parentRoom = `room:document:${parentDocumentId}`;
            updateTitleEvent = `document:receive:title:${parentDocumentId}`;
          } else {
            parentRoom = `user:${userId}`;
            updateTitleEvent = "document:receive:title:root";
          }
          console.log("DoucmentId: ", documentId);
          console.log("Parent Room: ", parentRoom);
          console.log("Title: ", updateTitleEvent);

          io.to(parentRoom).emit(updateTitleEvent, {
            documentId,
            title,
          });
        }
      );

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("[Socket.io] Client disconnected", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
