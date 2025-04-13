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

      socket.on("disconnect", () => {
        console.log("[Socket.io] Client disconnected", socket.id);
      });

      socket.on("document:update:title", ({ id, title }) => {
        io.emit("document:receive:title", { id, title });
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
