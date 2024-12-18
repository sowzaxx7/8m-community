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

  const { id } = req.query;

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Não Autorizado" });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Não Autorizado" });
  }

  if (!id) {
    return res.status(400).json({ message: "ID do post inválido" });
  }

  try {
    const decoded = jwt.verify(
      token,
      String(process.env.SECRET_KEY)
    ) as JwtPayload;

    const user = await prisma.users.findUnique({
      where: { id: decoded.user_id },
      select: {
        avatar: true,
        banned: true,
        email: false,
        id: true,
        joinedAt: true,
        posts: true,
        role: true,
        username: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const post = await prisma.posts.findUnique({
      where: { id: Number(id) },
      include: { author: true, file: true },
    });

    return res.status(200).json({
      post: post,
      author: user,
    });
  } catch (error) {
    console.error("Erro ao carregar posts:", error);
    return res.status(500).json({ message: "Erro ao carregar posts", error });
  } finally {
    await prisma.$disconnect();
  }
}
