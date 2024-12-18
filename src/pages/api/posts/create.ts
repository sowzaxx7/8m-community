import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs/promises";
import { IncomingForm, File as FormidableFile } from "formidable";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

export default async function CreatePostsAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Erro ao processar o formulário", err });
    }

    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const description = Array.isArray(fields.description)
      ? fields.description[0]
      : fields.description;
    const tag = Array.isArray(fields.tag) ? fields.tag[0] : fields.tag;

    const fileArray = files.file as FormidableFile[] | FormidableFile | undefined;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!title || !description || !tag) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
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

      const postData: any = {
        title: String(title),
        description: String(description),
        tag: String(tag),
        author: {
          connect: { id: String(user.id) },
        },
      };

      if (file) {
        const ext = path.extname(file.originalFilename || "").toLowerCase();
        const allowedExtensions = [".png", ".jpg", ".jpeg", ".txt", ".zip", ".rar", ".psd"];
        
        if (!allowedExtensions.includes(ext)) {
          return res.status(400).json({ message: "Tipo de arquivo não permitido" });
        }

        const isImage = [".png", ".jpg", ".jpeg"].includes(ext);
        const filePath = `./public/uploads/${file.originalFilename}`;
        const publicPath = `/uploads/${file.originalFilename}`;

        const data = await fs.readFile(file.filepath);
        await fs.writeFile(filePath, data);

        postData.file = {
          create: {
            isImage: isImage,
            filename: file.originalFilename,
            image: isImage ? publicPath : undefined,
          },
        };
      }

      await prisma.posts.create({
        data: postData,
        include: {
          author: true,
          file: true,
        },
      });

      if (tag === "anuncios") {

        if (user.role !== "Dono") {
          return res.status(401).json({ message: "Não autorizado" });
        }

        await prisma.notifications.create({
          data: {
            title: `Novo anúncio: ${title}`,
            type: "NEW",
          },
        });
      }

      return res.status(201).json({ message: "Post criado com sucesso" });
    } catch (error) {
      console.error("Erro ao criar post:", error);
      return res.status(500).json({ message: "Erro ao criar post", error });
    } finally {
      await prisma.$disconnect();
    }
  });
}
