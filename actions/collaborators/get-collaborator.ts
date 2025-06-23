"use server";

import { db } from "@/lib/db";

export const getCollaborator = async ({
  email,
  documentId,
}: {
  email: string;
  documentId: string;
}) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) return null;

  const collaborator = await db.collaborator.findUnique({
    where: {
      userId_documentId: {
        userId: user.id,
        documentId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return collaborator;
};
