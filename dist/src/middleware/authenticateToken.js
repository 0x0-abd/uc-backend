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
exports.isAdmin = exports.authenticateToken = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import './types/express';
const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const prisma = new client_1.PrismaClient();
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.jwt;
    if (!token)
        return res.status(403).send({
            success: false,
            message: "No token provided!"
        });
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, user) => {
        if (err)
            return res.sendStatus(403); //No Access
        if (!user) {
            return res.status(403).send({
                success: false,
                message: "Invalid token"
            });
        }
        req.user = user;
        // console.log(user)
        next();
    });
});
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield prisma.user.findUnique({
        where: {
            id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
        }
    });
    if ((user === null || user === void 0 ? void 0 : user.role) == "ADMIN") {
        next();
        return;
    }
    res.status(403).send({
        success: false,
        message: "Admin only"
    });
});
exports.isAdmin = isAdmin;
