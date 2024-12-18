import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function ActionAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { userId } = req.body as { userId: string };
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Não Autorizado" });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Não Autorizado" });
  }

  if (!userId) {
    return res.status(400).json({ message: "ID do usuário inválido" });
  }

  if (!["ban", "unban"].includes(String(req.query.action))) {
    return res.status(400).json({ message: "Ação inválida" });
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

    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (String(req.query.action) === "ban") {
      await prisma.users.update({
        where: { id: userId },
        data: { banned: true },
      });
      return res.status(200).json({ message: "Usuário banido com sucesso" });
    } else if (String(req.query.action) === "unban") {
      await prisma.users.update({
        where: { id: userId },
        data: { banned: false },
      });
      return res.status(200).json({ message: "Usuário desbanido com sucesso" });
    }

  } catch (error) {
    console.error("Erro ao processar a ação:", error);
    return res.status(500).json({ message: "Erro ao processar a ação", error });
  } finally {
    await prisma.$disconnect();
  }
}
