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

    const { documentId } = req.body;
    console.log("Document ID: ", documentId);

    const existingDocument = await db.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found!" });
    }

    if (user.id !== existingDocument?.userId) {
      return res.status(403).json("Unauthorized!");
    }

    const recursiveRestore = async (documentId: string) => {
      const children = await db.document.findMany({
        where: {
          userId: user.id,
          parentDocumentId: documentId || "",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!children) return;

      for (const child of children) {
        await recursiveRestore(child.id);

        await db.document.update({
          where: {
            id: child.id,
          },
          data: {
            isArchived: false,
          },
        });
      }
    };

    const options: Partial<{ isArchived: boolean; parentDocumentId: string }> =
      {
        isArchived: false,
      };

    if (
      existingDocument.parentDocumentId &&
      existingDocument.parentDocumentId != ""
    ) {
      const parent = await db.document.findUnique({
        where: {
          userId: user.id,
          id: existingDocument.parentDocumentId,
        },
      });

      if (parent?.isArchived) {
        options.parentDocumentId = "";
      }
    }

    await recursiveRestore(documentId);

    const document = await db.document.update({
      where: {
        id: documentId,
      },
      data: options,
    });

    res?.socket?.server?.io?.emit("document:restore", document);

    return res.status(200).json(document);
  } catch (error) {
    console.error("[RESTORE_DOCUMENT]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
