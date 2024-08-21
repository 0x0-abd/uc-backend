import { Router } from "express";
import { PrismaClient } from '@prisma/client';
import { upload, uploadImage } from "../controllers/mediaController";

const router = Router();

export default (prisma: PrismaClient) => {
    router.post("/upload", upload, uploadImage);

    return router;
};