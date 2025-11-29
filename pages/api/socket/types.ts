export type DocumentRoomAction = {
  documentId: string;
  userId: string;
};

export type TitleUpdateEvent = {
  documentId: string;
  title?: string;
  icon?: string;
};

export type ContentUpdateEvent = {
  documentId: string;
  content: string;
  userId: string;
};

export type DocHeaderChangeEvent = {
  documentId: string;
  userId: string;
  title?: string;
  icon?: string;
};

export type DocChangeEvent = {
  documentId: string;
  userId: string;
  steps: any[];
  version: number;
  timestamp: number;
};

export type CursorUpdateEvent = {
  documentId: string;
  userId: string;
  userName: string;
  color: string;
  cursor?: number;
  selection?: { from: number; to: number };
  isActive?: boolean;
};

export type CollaboratorDisconnectEvent = {
  userId: string;
};

export type SaveStatusEvent = {
  status: "saving" | "saved" | "error";
  documentId: string;
  error?: string;
};

export type ActiveUsersUpdateEvent = {
  documentId: string;
  userId: string;
  action: "joined" | "left";
};

export type SocketErrorEvent = {
  event: string;
  message: string;
  code: string;
};