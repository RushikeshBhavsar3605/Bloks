"use server";

import { currentUser } from "@/lib/auth";

export const getDocuments = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const documents = await prisma?.document.findMany();

  return documents;
};
