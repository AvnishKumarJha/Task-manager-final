import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateTokens, verifyRefresh } from "../utils/jwt";
import { registerSchema } from "../validators/auth";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({ data: { email: parsed.data.email, password: hash } });
  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Invalid password" });

  res.json(generateTokens(user.id));
};

export const refresh = (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const d = verifyRefresh(refreshToken);
  res.json(generateTokens(d.userId));
};
