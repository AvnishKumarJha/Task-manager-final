import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/jwt";

export const auth = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const d = verifyAccess(token);
    req.userId = d.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
