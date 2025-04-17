import { createDocumentSchema } from "@/schemas";
import { currentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const validatedFields = createDocumentSchema.safeParse(req.body);

    if (!validatedFields.success) {
      return res.status(400).json({ error: "Invalid Fields!" });
    }

    const { title, parentDocument } = validatedFields.data;
    const user = await currentUser(req);

    if (!user) {
      return res.status(401).json({ error: "Not authenticated!" });
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

    res?.socket?.server?.io?.emit("document:created", document);

    return res.status(200).json(document);
  } catch (error) {
    console.error("[CREATE_DOCUMENT]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
