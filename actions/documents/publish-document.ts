"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserSubscription } from "../users/get-user-subscription";
import { Document } from "@prisma/client";

const getUserPlanAccess = async (userId: string) => {
  const publishedDocumentCount = await db.document.count({
    where: {
      userId,
      isPublished: true,
    },
  });

  const subscriptionPlan = await getUserSubscription(userId);

  if (subscriptionPlan === "free" && publishedDocumentCount >= 3) {
    return false;
  }

  if (subscriptionPlan === "pro" && publishedDocumentCount >= 15) {
    return false;
  }

  return true;
};

export const publishDocument = async (
  documentId: string
): Promise<{
  success: boolean;
  data: Document | { upgradeRequired: boolean };
}> => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const document = await db.document.findUnique({
    where: {
      id: documentId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!document || user.id != document.userId) {
    throw new Error("Not authorized");
  }

  const hasAccess = await getUserPlanAccess(user.id);
  if (!hasAccess) {
    return {
      success: false,
      data: {
        upgradeRequired: true,
      },
    };
  }

  return {
    success: true,
    data: await db.document.update({
      where: {
        id: document.id,
      },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
  };
};
