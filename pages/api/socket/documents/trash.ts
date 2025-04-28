import { currentUser } from "@/lib/auth-server";
import { getArchivedDocuments } from "@/services/document-service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  const user = await currentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Not authenticated!" });
  }

  // GET - Fetch all trashed documents
  if (req.method === "GET") {
    const response = await getArchivedDocuments(user.id);

    if (!response.success) {
      return res.status(response.status || 400).json({ error: response.error });
    }

    return res.status(response.status || 200).json(response.data);
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
