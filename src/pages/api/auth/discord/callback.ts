import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { URLSearchParams } from "url";
import { PrismaClient } from "@prisma/client";
import { setCookie } from "nookies";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function CallBackAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (!code || Array.isArray(code)) {
    return res.status(400).json({
      success: false,
      message: "Código de autorização ausente ou inválido",
    });
  }

  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.setHeader("X-XSS-Protection", "1; mode=block");

  try {
    const formData = new URLSearchParams();
    formData.append("client_id", process.env.CLIENT_ID as string);
    formData.append("client_secret", process.env.CLIENT_SECRET as string);
    formData.append("grant_type", "authorization_code");
    formData.append("code", code);
    formData.append("redirect_uri", process.env.REDIRECT_URI as string);

    const response = await axios.post(
      "https://discord.com/api/v10/oauth2/token",
      formData,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (response.data && response.data.access_token) {
      const accessToken = response.data.access_token;

      const request = await axios.get("https://discord.com/api/v10/users/@me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(request.data)

      const userData = {
        user_id: String(request.data.id),
        user_avatar: `https://cdn.discordapp.com/avatars/${request.data.id}/${request.data.avatar}.png?size=2048` || "",
        user_email: request.data.email,
        user_name: request.data.username,
      };

      const existingUser = await prisma.users.findUnique({
        where: { id: userData.user_id },
      });

      if (!existingUser) {
        await prisma.users.create({
          data: {
            avatar: userData.user_avatar,
            email: userData.user_email,
            username: userData.user_name,
            id: userData.user_id,
          },
        });
      }

      const token = sign(
        { user_id: userData.user_id },
        String(process.env.SECRET_KEY),
        {
          expiresIn: "1d",
        }
      );

      setCookie({ res }, "8m.auth", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600,
        path: "/",
      });

      return res.status(307).redirect("/forum/anuncios");
    } else {
      return res.status(500).json({
        success: false,
        message: "Erro ao autenticar: Token não encontrado",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor", error });
  } finally {
    await prisma.$disconnect();
  }
}
