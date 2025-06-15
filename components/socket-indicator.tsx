"use client";

import { useSocket } from "./providers/socket-provider";
import { Badge } from "./ui/badge";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <Badge variant="destructive" className="whitespace-nowrap">
        Not connected
      </Badge>
    );
  }

  return <Badge variant="connected">Connected</Badge>;
};
