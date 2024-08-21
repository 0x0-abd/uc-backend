import { Request, Response } from "express";
import prisma from "../../prisma/prisma-client";
import bcrypt, { compare } from "bcrypt"
import jwt from "jsonwebtoken"
import axios from "axios";
import qs from 'qs'

const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const maxAge = 60 * 60 * 1000;

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, name } = req.body;
        const checkUser = await prisma.user.findUnique({
            where: {
                username,
            }
        })
        if (checkUser) return res.status(409).send({
            success: false,
            message: "Username already exists"
        })

        const checkEmail = await prisma.user.findUnique({
            where: {
                email,
            }
        })
        if (checkEmail) return res.status(409).send({
            success: false,
            message: "Email already exists"
        })

        const hashedPawword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPawword,
                name
            }
        })

        const token = jwt.sign({ userId: user.id, userRole: user.role }, jwtSecret, { expiresIn: maxAge })
        res.cookie("jwt", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
            // secure: true, // Cookie will only be sent over HTTPS
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
        if (!foundUser || !foundUser.password || !await bcrypt.compare(password, foundUser.password))
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

export const getUser = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).send({ success: false, message: "No token provided" });
        }
        const decoded = jwt.verify(token, jwtSecret) as { userId: number };
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
            select: {
                id: true,
                username: true,
                role: true,
                name: true,
                email: true,
            }
        });
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }
        return res.status(200).send({ success: true, user });
    } catch (e) {
        console.error(e);
        return res.status(400).json({ success: false, message: e });
    }
}


export const signOut = async (req: Request, res: Response) => {
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

interface GoogleTokensResult {
    access_token: string,
    expires_in: Number,
    refresh_token: string,
    scope: string,
    id_token: string
}

function generateUniqueUsername(emailPrefix: string): string {
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${emailPrefix}_${randomString}`;
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { oldUsername, username, name } = req.body;
        const checkUser = await prisma.user.findUnique({
            where: {
                username,
            }
        })
        if (checkUser && checkUser.username !== oldUsername) return res.status(409).send({
            success: false,
            message: "Username already exists"
        })

        const updateUser = await prisma.user.update({
            where: {
                username: oldUsername,
            },
            data: {
                username,
                name,
            }
        })
        const token = jwt.sign({ userId: updateUser.id, userRole: updateUser.role }, jwtSecret, { expiresIn: maxAge })
        res.cookie("jwt", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
            // secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            sameSite: "strict"
        });
        return res.status(200).send({
            success: true,
            username: updateUser.username,
            id: updateUser.id,
            role: updateUser.role,
            name: updateUser.name,
            message: "Profile update successfully!"
        })
    } catch (e) {
        console.error(e)
        res.status(400).json({
            success: false,
            message: e
        });
    }
}

export async function getAndUpdateUser(email: string, name: string) {
    const emailPrefix = email.split('@')[0];
    let username = generateUniqueUsername(emailPrefix);
    try {
        let existingUser = await prisma.user.findUnique({
            where: {
                username,
            },
        });
        while (existingUser) {
            username = generateUniqueUsername(emailPrefix);
            existingUser = await prisma.user.findUnique({
                where: {
                    username,
                },
            });
        }

        let user = await prisma.user.upsert({
            where: {
                email,
            },
            update: {
                name,
            },
            create: {
                name,
                email,
                username,
            },
        })

        const returnedUser = {
            success: true,
            username: user.username,
            id: user.id,
            role: user.role,
            name: user.name,
            message: "Signed Up succesfully!"
        }
        return returnedUser;
    } catch (e: any) {
        console.log("Unable to check for OAuth Users", e.message);
        throw new Error(e.message)
    }
}

export async function getGoogleOAuthTokens({ code }: { code: string }): Promise<GoogleTokensResult> {
    const url = "https://oauth2.googleapis.com/token";

    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
        grant_type: "authorization_code"
    };

    try {
        const res = await axios.post<GoogleTokensResult>(url, qs.stringify(values), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        return res.data;
    } catch (e: any) {
        console.log(e, "Failed to fetch Google OAuth Tokens");
        throw new Error(e.message);
    }

}

interface GoogleUserResult {
    id: string,
    email: string,
    email_verified: boolean,
    name: string,
    family_name: string,
    picture: string,
    locale: string
}

export async function getGoogleUser({ id_token, access_token }: { id_token: string, access_token: string }): Promise<GoogleUserResult> {
    try {
        const res = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        });
        return res.data;
    } catch (e: any) {
        console.log(e.response.data.error)
        console.log("Error fetching Google User", e.message)
        // console.log("OOgabooga")
        throw new Error(e.message)
    }
}

