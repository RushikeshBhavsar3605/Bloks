import { Collaborator, CollaboratorRole, Document } from "@prisma/client";

export type DocumentWithMeta = Document & {
  isOwner: boolean;
  role: CollaboratorRole | "OWNER" | null;
  owner: {
    id?: string;
    name: string | null;
    email?: string | null;
    image: string | null;
  };
  collaborators?: Collaborator[];
};

export type CollaboratorWithMeta = Collaborator & {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
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
