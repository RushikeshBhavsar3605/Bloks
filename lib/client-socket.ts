import { io, Socket } from "socket.io-client";

// Store sockets per user ID to avoid conflicts
const sockets: Map<string, Socket> = new Map();

export const getSocket = (userId: string): Socket => {
  // Check if we already have a socket for this user
  if (sockets.has(userId)) {
    const existingSocket = sockets.get(userId)!;
    // Return existing socket if it's still connected
    if (existingSocket.connected) {
      return existingSocket;
    } else {
      // Clean up disconnected socket
      existingSocket.disconnect();
      sockets.delete(userId);
    }
  }

  // Create new socket for this user
  const socket = io(process.env.NEXT_PUBLIC_APP_URL!, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    query: {
      userId: userId,
    },
  });

  // Store the socket for this user
  sockets.set(userId, socket);

  // Clean up on disconnect
  socket.on("disconnect", () => {
    sockets.delete(userId);
  });

  return socket;
};
