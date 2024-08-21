import { Request, Response } from "express";
import prisma from "../../prisma/prisma-client";
import jwt from "jsonwebtoken";
import { getAndUpdateUser, getGoogleOAuthTokens, getGoogleUser } from "./authController";

const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const maxAge = 60 * 60 * 1000;


export const googleOAuthHandler = async (req: Request, res: Response) => {
    // get code from qs
    console.log("Helloo")
    const code = req.query.code as string

    try {
        // get id and access token with code
        const { id_token, access_token } = await getGoogleOAuthTokens({ code });
        // console.log({id_token, access_token});

        // get user with tokens

        // const googleUser = jwt.decode(id_token)
        const googleUser = await getGoogleUser({ id_token, access_token });
        console.log({ googleUser })

        if (!googleUser.email_verified) {
            return res.status(403).send('Google Account not verified');
        }

        // upsert user
        // create session
        // console.log(req.body)
        const foundUser = await getAndUpdateUser(googleUser.email, googleUser.name)

        const token = jwt.sign({ userId: foundUser?.id, userRole: foundUser?.role }, jwtSecret, { expiresIn: maxAge })
        res.cookie("jwt", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
            secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            sameSite: "strict"
        });
        // console.log(token)
        return res.redirect(process.env.ORIGIN as string);

        // create access and refresh token
        // set cookies
        // redirect back to client
    } catch (e: any) {
        console.log(e.message)
        return res.redirect(process.env.ORIGIN as string)
    }
}