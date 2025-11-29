import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types";
import { verifyUserSession } from "@/services/socket-service";
import { DocumentSaveManager } from "./managers/document-save-manager";
import { SocketDocumentManager } from "./socket-manager";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  // Add safety check for production environment
  if (!res.socket?.server) {
    console.error("[Socket.io] Server not available");
    return res.status(500).json({ error: "Socket server not available" });
  }
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer = res.socket.server as NetServer & { io?: ServerIO };

    try {
      const io = new ServerIO(httpServer, {
        path: path,
        addTrailingSlash: false,
        cors: {
          origin:
            process.env.NODE_ENV === "production"
              ? [process.env.NEXT_PUBLIC_APP_URL || ""]
              : ["http://localhost:3000"],
          methods: ["GET", "POST"],
        },
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
      console.log("[Socket.io] Server initialized successfully");
    } catch (error) {
      console.error("[Socket.io] Failed to initialize server:", error);
      return res
        .status(500)
        .json({ error: "Failed to initialize Socket server" });
    }
  }

  res.end();
};

export default ioHandler;
