"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const getInviteCode = async ({
  documentId,
  generate,
}: {
  documentId: string;
  generate?: boolean;
}) => {
  const user = await currentUser();
  if (!user) return null;

  const isOwner = await db.document.findUnique({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  if (!isOwner) return null;

  const token = uuidv4();

  const existingTokenModel = await db.documentInviteToken.findUnique({
    where: {
      documentId,
    },
  });

  if (!generate && existingTokenModel) return existingTokenModel.token;

  if (existingTokenModel) {
    await db.documentInviteToken.update({
      where: {
        token: existingTokenModel.token,
      },
      data: {
        token,
      },
    });
  } else {
    await db.documentInviteToken.create({
      data: {
        documentId,
        token,
      },
    });
  }

  return token;
};
