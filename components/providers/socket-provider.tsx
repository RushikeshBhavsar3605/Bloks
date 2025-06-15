"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  joinDocument: (documentId: string, userId: string) => void;
  leaveDocument: (documentId: string, userId: string) => void;
  joinActiveDocument: (documentId: string, userId: string) => void;
  leaveActiveDocument: (documentId: string, userId: string) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinDocument: () => {},
  leaveDocument: () => {},
  joinActiveDocument: () => {},
  leaveActiveDocument: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useCurrentUser();

  useEffect(() => {
    fetch("/api/socket/io").catch((err) => {
      console.error("Socket server init failed", err);
    });

    const socketInstance = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_APP_URL!,
      {
        path: "/api/socket/io",
        addTrailingSlash: false,
        query: {
          userId: user?.id || "",
        },
      }
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

  const joinDocument = (documentId: string, userId: string) => {
    if (socket) {
      socket.emit("join-document", { documentId, userId });
    }
  };

  const leaveDocument = (documentId: string, userId: string) => {
    if (socket) {
      socket.emit("leave-document", { documentId, userId });
    }
  };

  const joinActiveDocument = (documentId: string, userId: string) => {
    if (socket) {
      console.log("Active In: ", documentId, userId);
      socket.emit("join-active-document", { documentId, userId });
    }
  };

  const leaveActiveDocument = (documentId: string, userId: string) => {
    if (socket) {
      socket.emit("leave-active-document", { documentId, userId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinDocument,
        leaveDocument,
        joinActiveDocument,
        leaveActiveDocument,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
