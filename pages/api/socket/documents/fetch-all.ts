import { currentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await currentUser(req);

    if (!user || !user.id) {
      return res.status(401).json({ error: "Not authenticated!" });
    }

    const parentDocument = (req.query.parentDocument as string) || "";

    const documents = await db?.document.findMany({
      where: {
        userId: user.id,
        parentDocumentId: parentDocument,
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(documents);
  } catch (error) {
    console.log("[FETCH_ALL_DOCUMENTS]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
