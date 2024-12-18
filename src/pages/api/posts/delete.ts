import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export default async function DeletePostsAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Metodo não permitido" });
  }

  const { postId } = req.body as { postId: number };
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Não Autorizado" });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Não Autorizado" });
  }

  if (!postId) {
    return res.status(400).json({ message: "ID do post inválido" });
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

    if (user.role !== "Dono") {
      return res.status(401).json({ message: "Não Autorizado" });
    }

    const post = await prisma.posts.findUnique({
      where: { id: postId },
      include: { file: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Este post não existe" });
    }

    if (post.file && post.file.length > 0) {
      for (const file of post.file) {
        const filePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          file.filename
        );
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error(`Erro ao excluir o arquivo ${file.filename}:`, err);
        }
      }
    }

    if (post.file && post.file.length > 0) {
      await prisma.files.deleteMany({
        where: {
          id: {
            in: post.file.map(file => file.id),
          },
        },
      });
    }

    await prisma.posts.delete({
      where: { id: postId },
    });

    return res.status(201).json({ message: "Post deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return res.status(500).json({ message: "Erro ao deletar post", error });
  } finally {
    await prisma.$disconnect();
  }
}
