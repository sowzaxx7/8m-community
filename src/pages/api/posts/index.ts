import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function PostsAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metodo não permitido" });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Não Autorizado" });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Não Autorizado" });
  }

  try {
    const decoded = jwt.verify(
      token,
      String(process.env.SECRET_KEY)
    ) as JwtPayload;

    const user = await prisma.users.findUnique({
      where: { id: decoded.user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const allPosts = await prisma.posts.findMany({
      where: { tag: String(req.query.tag) },
      include: { author: true, file: true },
    });
    const totalPosts = await prisma.posts.count();

    return res.status(200).json({
      posts: allPosts,
      length: totalPosts,
    });
  } catch (error) {
    console.error("Erro ao carregar posts:", error);
    return res.status(500).json({ message: "Erro ao carregar posts", error });
  } finally {
    await prisma.$disconnect();
  }
}
