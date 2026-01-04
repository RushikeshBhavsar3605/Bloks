import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types";
import { verifyUserSession } from "@/services/socket-service";
import { DocumentSaveManager } from "./managers/document-save-manager";
import { SocketDocumentManager } from "./socket-manager";

const editLatencies: number[] = [];
export function setEditLatencies(newLatency: number) {
  editLatencies.push(newLatency);
}
let editEventCount = 0;
export function setEditEventCount() {
  editEventCount++;
}

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
      // Performance metrics
      setInterval(() => {
        // console.log("EditLatencies", editLatencies);
        if (editLatencies.length === 0) return;

        const sorted = [...editLatencies].sort((a, b) => a - b);
        const p90 = sorted[Math.floor(sorted.length * 0.9)];
        const p99 = sorted[Math.floor(sorted.length * 0.99)];
        const rps = editEventCount / 10;

        console.log("[DOC-METRICS]", {
          activeEditors: io.engine.clientsCount,
          rps,
          p90,
          p99,
        });

        editLatencies.length = 0;
        editEventCount = 0;
      }, 10_000);

      // Set the io instance for DocumentSaveManager
      DocumentSaveManager.setIoInstance(io);

      let activeConnections = 0;
      io.on("connection", async (socket) => {
        activeConnections++;
        console.log("Active sockets:", activeConnections);
        try {
          const userId = socket.handshake.query.userId as string;
          const testingId = socket.handshake.query.testId as string;

          if (testingId !== process.env.TEST_ID) {
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
          }

          // Join user's personal room
          const userRoom = `user:${userId}`;
          socket.join(userRoom);

          // Initialize document room manager
          const documentManager = new SocketDocumentManager(socket, io, userId);

          socket.on("disconnect", () => {
            activeConnections--;
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
