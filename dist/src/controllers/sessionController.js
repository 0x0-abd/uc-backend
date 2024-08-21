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
exports.googleOAuthHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authController_1 = require("./authController");
const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const maxAge = 60 * 60 * 1000;
const googleOAuthHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get code from qs
    console.log("Helloo");
    const code = req.query.code;
    try {
        // get id and access token with code
        const { id_token, access_token } = yield (0, authController_1.getGoogleOAuthTokens)({ code });
        // console.log({id_token, access_token});
        // get user with tokens
        // const googleUser = jwt.decode(id_token)
        const googleUser = yield (0, authController_1.getGoogleUser)({ id_token, access_token });
        console.log({ googleUser });
        if (!googleUser.email_verified) {
            return res.status(403).send('Google Account not verified');
        }
        // upsert user
        // create session
        // console.log(req.body)
        const foundUser = yield (0, authController_1.getAndUpdateUser)(googleUser.email, googleUser.name);
        const token = jsonwebtoken_1.default.sign({ userId: foundUser === null || foundUser === void 0 ? void 0 : foundUser.id, userRole: foundUser === null || foundUser === void 0 ? void 0 : foundUser.role }, jwtSecret, { expiresIn: maxAge });
        res.cookie("jwt", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
            secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            sameSite: "strict"
        });
        // console.log(token)
        return res.redirect(process.env.ORIGIN);
        // create access and refresh token
        // set cookies
        // redirect back to client
    }
    catch (e) {
        console.log(e.message);
        return res.redirect(process.env.ORIGIN);
    }
});
exports.googleOAuthHandler = googleOAuthHandler;
