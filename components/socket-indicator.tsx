"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useSocket } from "./providers/socket-provider";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <div className="flex items-center gap-1.5">
        <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
        <span>Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
      <span>Online</span>
    </div>
  );
};
