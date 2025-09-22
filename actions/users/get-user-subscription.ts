"use server";

import { db } from "@/lib/db";

type planType = "free" | "pro" | "team";

export const getUserSubscription = async (
  userId: string
): Promise<planType> => {
  const subscription = await db.subscription.findUnique({
    where: {
      userId,
    },
  });

  if (!subscription) {
    return "free";
  }

  return subscription.plan as planType;
};
