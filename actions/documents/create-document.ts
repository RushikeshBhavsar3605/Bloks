"use server";

import * as z from "zod";
import { createDocumentSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// ❌ Deprecated: This server action has been replaced by `/api/socket/document/create`
// Reason: Switched to API route for real-time socket support
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
      parentDocumentId: parentDocument || "",
      userId: user.id!,
      isArchived: false,
      isPublished: false,
    },
  });

  return document;
};
