import { Router } from "express";
import { PrismaClient } from '@prisma/client';
import { register, login, signOut } from "../controllers/authController";

const router = Router();

export default (prisma: PrismaClient) => {
    router.post("/register", register);
    router.post("/login", login);
    router.post("/signout", signOut)

    return router;
};