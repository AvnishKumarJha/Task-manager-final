import express from "express";
import { register, login, refresh } from "../controllers/auth.controller";
const r = express.Router();
r.post("/register", register);
r.post("/login", login);
r.post("/refresh", refresh);
export default r;
