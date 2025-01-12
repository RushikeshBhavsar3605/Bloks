"use server";

import * as z from "zod";
import { createDocumentSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const createDocument = async (
  values: z.infer<typeof createDocumentSchema>
) => {
  const validatedFields = createDocumentSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }

  const { title, parentDocument } = validatedFields.data;

  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const document = await db.document.create({
    data: {
      title,
      parentDocumentId: parentDocument || undefined,
      userId: user.id!,
      isArchived: false,
      isPublished: false,
    },
  });

  return { success: "New note created!" };
};
