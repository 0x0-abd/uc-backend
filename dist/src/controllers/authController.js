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
exports.signOut = exports.login = exports.register = void 0;
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const maxAge = 60 * 60 * 1000;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, name } = req.body;
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
        const hashedPawword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma_client_1.default.user.create({
            data: {
                username,
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
            sameSite: "strict"
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
        if (!foundUser || !(yield bcrypt_1.default.compare(password, foundUser.password)))
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
            sameSite: "strict"
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
const signOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('jwt', {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "strict"
    });
    return res.status(200).send({
        success: true,
        message: "Signed out successfully"
    });
});
exports.signOut = signOut;
