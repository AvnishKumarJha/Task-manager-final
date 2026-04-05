import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

export const generateTokens = (userId: number) => ({
  accessToken: jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" }),
  refreshToken: jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" })
});

export const verifyAccess = (t: string) => jwt.verify(t, ACCESS_SECRET) as any;
export const verifyRefresh = (t: string) => jwt.verify(t, REFRESH_SECRET) as any;
