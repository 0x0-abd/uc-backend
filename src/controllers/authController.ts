import { Request, Response } from "express";
import prisma from "../../prisma/prisma-client";
import bcrypt, { compare } from "bcrypt"
import jwt from "jsonwebtoken"

const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const maxAge = 60 * 60 * 1000;

export const register = async (req: Request, res: Response) => {
    try {
        const { username, password, name } = req.body;
        const checkUser = await prisma.user.findUnique({
            where: {
                username,
            }
        })

        if (checkUser) return res.status(409).send({
            success: false,
            message: "Username already exists"
        })

        const hashedPawword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPawword,
                name
            }
        })

        const token = jwt.sign({ userId: user.id, userRole: user.role }, jwtSecret, { expiresIn: maxAge })
        res.cookie("jwt", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
            secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            sameSite: "strict"
        });
        return res.status(200).send({
            success: true,
            username: user.username,
            id: user.id,
            role: user.role,
            name: user.name,
            message: "Signed Up succesfully!"
        })

    } catch (e) {
        console.error(e)
        res.status(400).json({
            success: false,
            message: e
        });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        // console.log(req.body)
        const { username, password } = req.body;
        const foundUser = await prisma.user.findFirst({
            where: {
                username
            }
        })
        if (!foundUser || !await bcrypt.compare(password, foundUser.password))
            return res.status(404).send({
                success: false,
                message: "Invalid credentials"
            })
        
        const token = jwt.sign({ userId: foundUser?.id, userRole: foundUser?.role }, jwtSecret, { expiresIn: maxAge })
        res.cookie("jwt", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
            secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            sameSite: "strict"
        });
        // console.log(token)
        return res.status(200).send({
            success: true,
            username: foundUser?.username,
            id: foundUser?.id,
            role: foundUser?.role,
            name: foundUser?.name,
            message: "Signed In succesfully!"
        })
    } catch (e) {
        console.error(e)
        return res.status(400).json({
            success: false,
            message: e
        });
    }
}

export const signOut = async(req: Request, res: Response) => {
    res.clearCookie('jwt', {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "strict"
    });
    return res.status(200).send({
        success: true,
        message: "Signed out successfully"
    })
}