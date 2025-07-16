import { Collaborator, CollaboratorRole, Document } from "@prisma/client";

export type DocumentWithMeta = Document & {
  isOwner: boolean;
  role: CollaboratorRole | "OWNER" | null;
  owner: {
    name: string | null;
    image: string | null;
  };
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
