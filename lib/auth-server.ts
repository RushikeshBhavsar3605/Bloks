import { getToken } from "next-auth/jwt";
import { NextApiRequest } from "next";

interface UserType {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const currentUser = async (req: NextApiRequest) => {
  const token = await getToken({
    req: req as unknown as Request,
    // @ts-ignore
    secret: process.env.AUTH_SECRET,
  });

  console.log("Token in pages/api:", token);
  return (token?.user as UserType) || null;
};
