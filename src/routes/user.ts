import { Router, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const router = Router();

export default (prisma: PrismaClient) => {
    router.get("/all", async (req: Request, res: Response) => {
        const users = await prisma.user.findMany();
        res.json(users);
    });
  
    return router;
};