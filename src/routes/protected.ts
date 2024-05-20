import { Router } from "express";
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from "../middleware/authenticateToken";
import { viewChatpage } from "../controllers/chatController";

const router = Router();

export default (prisma: PrismaClient) => {
    router.get("/", authenticateToken, viewChatpage);
  
    return router;
};