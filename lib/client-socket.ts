import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL!, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      query: {
        userId: userId,
      },
    });
  }

  return socket;
};
