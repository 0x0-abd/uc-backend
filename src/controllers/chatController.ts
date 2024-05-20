import { Request, Response } from "express";
import prisma from "../../prisma/prisma-client";

export const viewChatpage = async (req: Request, res: Response) => {
    const user = req.user
    const messages = await prisma.message.findMany()
    // console.log(messages)
    res.status(200).json(messages)
}