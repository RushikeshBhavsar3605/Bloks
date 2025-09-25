"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCoeditors } from "../collaborators/get-co-editors";

export const getUsageStats = async (): Promise<{
  personalDocument: number;
  publicDocument: number;
  coeditorsCount: number;
  collaboratingDocument: number;
}> => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const documentCreatedCount = await db.document.count({
    where: {
      userId: user.id,
    },
  });

  const publicDocumentCount = await db.document.count({
    where: {
      userId: user.id,
      isPublished: true,
    },
  });

  const documents = await db.document.findMany({
    where: {
      userId: user.id,
    },
    select: {
      collaborators: {
        select: {
          userId: true,
        },
      },
    },
  });

  let maximumCoeditors = 0;
  documents.map(
    (c) =>
      (maximumCoeditors = Math.max(maximumCoeditors, c.collaborators.length))
  );

  const coeditors = await getCoeditors(user.id as string);

  const coeditorsCount = coeditors.totalUniqueCollaborators;

  const collaboratingDocumentCount = coeditors.count;

  return {
    personalDocument: documentCreatedCount,
    publicDocument: publicDocumentCount,
    coeditorsCount: coeditorsCount,
    collaboratingDocument: collaboratingDocumentCount,
  };
};
