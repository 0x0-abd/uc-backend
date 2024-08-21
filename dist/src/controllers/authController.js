"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleUser = exports.getGoogleOAuthTokens = exports.getAndUpdateUser = exports.updateUser = exports.signOut = exports.getUser = exports.login = exports.register = void 0;
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const maxAge = 60 * 60 * 1000;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, name } = req.body;
        const checkUser = yield prisma_client_1.default.user.findUnique({
            where: {
                username,
            }
        });
        if (checkUser)
            return res.status(409).send({
                success: false,
                message: "Username already exists"
            });
        const checkEmail = yield prisma_client_1.default.user.findUnique({
            where: {
                email,
            }
        });
        if (checkEmail)
            return res.status(409).send({
                success: false,
                message: "Email already exists"
            });
        const hashedPawword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma_client_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPawword,
                name
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, userRole: user.role }, jwtSecret, { expiresIn: maxAge });
        res.cookie("jwt", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
            // secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            secure: true,
            sameSite: "none"
        });
        return res.status(200).send({
            success: true,
            username: user.username,
            id: user.id,
            role: user.role,
            name: user.name,
            message: "Signed Up succesfully!"
        });
    }
    catch (e) {
        console.error(e);
        res.status(400).json({
            success: false,
            message: e
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log(req.body)
        const { username, password } = req.body;
        const foundUser = yield prisma_client_1.default.user.findFirst({
            where: {
                username
            }
        });
        if (!foundUser || !foundUser.password || !(yield bcrypt_1.default.compare(password, foundUser.password)))
            return res.status(404).send({
                success: false,
                message: "Invalid credentials"
            });
        const token = jsonwebtoken_1.default.sign({ userId: foundUser === null || foundUser === void 0 ? void 0 : foundUser.id, userRole: foundUser === null || foundUser === void 0 ? void 0 : foundUser.role }, jwtSecret, { expiresIn: maxAge });
        res.cookie("jwt", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
            secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            sameSite: "none"
        });
        // console.log(token)
        return res.status(200).send({
            success: true,
            username: foundUser === null || foundUser === void 0 ? void 0 : foundUser.username,
            id: foundUser === null || foundUser === void 0 ? void 0 : foundUser.id,
            role: foundUser === null || foundUser === void 0 ? void 0 : foundUser.role,
            name: foundUser === null || foundUser === void 0 ? void 0 : foundUser.name,
            message: "Signed In succesfully!"
        });
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({
            success: false,
            message: e
        });
    }
});
exports.login = login;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).send({ success: false, message: "No token provided" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = yield prisma_client_1.default.user.findUnique({
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
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ success: false, message: e });
    }
});
exports.getUser = getUser;
const signOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('jwt', {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "none"
    });
    return res.status(200).send({
        success: true,
        message: "Signed out successfully"
    });
});
exports.signOut = signOut;
function generateUniqueUsername(emailPrefix) {
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${emailPrefix}_${randomString}`;
}
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldUsername, username, name } = req.body;
        const checkUser = yield prisma_client_1.default.user.findUnique({
            where: {
                username,
            }
        });
        if (checkUser && checkUser.username !== oldUsername)
            return res.status(409).send({
                success: false,
                message: "Username already exists"
            });
        const updateUser = yield prisma_client_1.default.user.update({
            where: {
                username: oldUsername,
            },
            data: {
                username,
                name,
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: updateUser.id, userRole: updateUser.role }, jwtSecret, { expiresIn: maxAge });
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
        });
    }
    catch (e) {
        console.error(e);
        res.status(400).json({
            success: false,
            message: e
        });
    }
});
exports.updateUser = updateUser;
function getAndUpdateUser(email, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const emailPrefix = email.split('@')[0];
        let username = generateUniqueUsername(emailPrefix);
        try {
            let existingUser = yield prisma_client_1.default.user.findUnique({
                where: {
                    username,
                },
            });
            while (existingUser) {
                username = generateUniqueUsername(emailPrefix);
                existingUser = yield prisma_client_1.default.user.findUnique({
                    where: {
                        username,
                    },
                });
            }
            let user = yield prisma_client_1.default.user.upsert({
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
            });
            const returnedUser = {
                success: true,
                username: user.username,
                id: user.id,
                role: user.role,
                name: user.name,
                message: "Signed Up succesfully!"
            };
            return returnedUser;
        }
        catch (e) {
            console.log("Unable to check for OAuth Users", e.message);
            throw new Error(e.message);
        }
    });
}
exports.getAndUpdateUser = getAndUpdateUser;
function getGoogleOAuthTokens(_a) {
    return __awaiter(this, arguments, void 0, function* ({ code }) {
        const url = "https://oauth2.googleapis.com/token";
        const values = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
            grant_type: "authorization_code"
        };
        try {
            const res = yield axios_1.default.post(url, qs_1.default.stringify(values), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            return res.data;
        }
        catch (e) {
            console.log(e, "Failed to fetch Google OAuth Tokens");
            throw new Error(e.message);
        }
    });
}
exports.getGoogleOAuthTokens = getGoogleOAuthTokens;
function getGoogleUser(_a) {
    return __awaiter(this, arguments, void 0, function* ({ id_token, access_token }) {
        try {
            const res = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            });
            return res.data;
        }
        catch (e) {
            console.log(e.response.data.error);
            console.log("Error fetching Google User", e.message);
            // console.log("OOgabooga")
            throw new Error(e.message);
        }
    });
}
exports.getGoogleUser = getGoogleUser;
