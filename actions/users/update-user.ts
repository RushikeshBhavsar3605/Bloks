"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const updateUser = async ({
  id,
  image,
  name,
  isTwoFactorEnabled,
}: {
  id: string;
  image?: string;
  name?: string;
  isTwoFactorEnabled?: boolean;
}) => {
  if (
    image == undefined &&
    name == undefined &&
    isTwoFactorEnabled == undefined
  )
    return null;

  const user = await currentUser();
  if (!user || user.id != id) throw new Error("Unauthorized");

  const updatedUser = await db.user.update({
    where: {
      id,
    },
    data: {
      ...(image && { image }),
      ...(name && { name }),
      ...(isTwoFactorEnabled && { isTwoFactorEnabled }),
    },
  });

  return updatedUser;
};
