import { Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: any, res: Response) => {
  const { page = 1, search = "", status } = req.query;
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.userId,
      title: { contains: search },
      ...(status ? { completed: status === "true" } : {})
    },
    skip: (Number(page) - 1) * 5,
    take: 5
  });
  res.json(tasks);
};

export const createTask = async (req: any, res: Response) => {
  const t = await prisma.task.create({ data: { title: req.body.title, userId: req.userId } });
  res.json(t);
};

export const toggleTask = async (req: any, res: Response) => {
  const id = Number(req.params.id);
  const cur = await prisma.task.findUnique({ where: { id } });
  const upd = await prisma.task.update({ where: { id }, data: { completed: !cur?.completed } });
  res.json(upd);
};

export const deleteTask = async (req: any, res: Response) => {
  await prisma.task.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Deleted" });
};
