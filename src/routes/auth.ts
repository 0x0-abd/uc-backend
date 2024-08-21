import { Router } from "express";
import { PrismaClient } from '@prisma/client';
import { register, login, signOut, getUser, updateUser } from "../controllers/authController";
import { authenticateToken } from "../middleware/authenticateToken";

const router = Router();

export default (prisma: PrismaClient) => {
    router.post("/register", register);
    router.post("/login", login);
    router.get("/getUser", getUser);
    router.post("/signout", signOut);
    router.post("/profile", authenticateToken, updateUser);
    

    return router;
};