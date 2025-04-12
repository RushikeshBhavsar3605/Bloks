import { currentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function (
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await currentUser(req);

    if (!user || !user.id) {
      return res.status(401).json({ error: "Not authenticated!" });
    }

    const { id, ...rest } = req.body;

    const existingDocument = await db.document.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found!" });
    }

    if (user.id !== existingDocument?.userId) {
      return res.status(403).json("Unauthorized!");
    }

    const document = await db.document.update({
      where: {
        id: id,
      },
      data: rest,
    });

    res?.socket?.server?.io?.emit(`document:update`, document);

    return res.status(200).json(document);
  } catch (error) {
    console.error("[UPDATE_DOCUMENT]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
