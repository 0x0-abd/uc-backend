import { PrismaClient, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
// import './types/express';

const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const prisma = new PrismaClient();

export interface UserPayload extends JwtPayload {
    id: number;
    username: string;
    role: string;
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(403).send({
        success: false,
        message: "No token provided!"
    })

    jwt.verify(token, jwtSecret, (err: any, user: any) => {
        if (err) return res.sendStatus(403) //No Access
        if (!user) {
            return res.status(403).send({
                success: false,
                message: "Invalid token"
            });
        }
        req.user = user
        // console.log(user)
        next();
    })
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user?.id
        }
    })
    if (user?.role == "ADMIN") {
        next();
        return;
    }
    res.status(403).send({
        success: false,
        message: "Admin only"
    })
}