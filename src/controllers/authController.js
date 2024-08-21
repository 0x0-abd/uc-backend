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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleUser = exports.getGoogleOAuthTokens = exports.getAndUpdateUser = exports.updateUser = exports.signOut = exports.getUser = exports.login = exports.register = void 0;
var prisma_client_1 = require("../../prisma/prisma-client");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var axios_1 = require("axios");
var qs_1 = require("qs");
var jwtSecret = process.env.JWT_SECRET || 'default_secret';
var maxAge = 60 * 60 * 1000;
var register = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, name_1, checkUser, checkEmail, hashedPawword, user, token, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, username = _a.username, email = _a.email, password = _a.password, name_1 = _a.name;
                return [4 /*yield*/, prisma_client_1.default.user.findUnique({
                        where: {
                            username: username,
                        }
                    })];
            case 1:
                checkUser = _b.sent();
                if (checkUser)
                    return [2 /*return*/, res.status(409).send({
                            success: false,
                            message: "Username already exists"
                        })];
                return [4 /*yield*/, prisma_client_1.default.user.findUnique({
                        where: {
                            email: email,
                        }
                    })];
            case 2:
                checkEmail = _b.sent();
                if (checkEmail)
                    return [2 /*return*/, res.status(409).send({
                            success: false,
                            message: "Email already exists"
                        })];
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 3:
                hashedPawword = _b.sent();
                return [4 /*yield*/, prisma_client_1.default.user.create({
                        data: {
                            username: username,
                            email: email,
                            password: hashedPawword,
                            name: name_1
                        }
                    })];
            case 4:
                user = _b.sent();
                token = jsonwebtoken_1.default.sign({ userId: user.id, userRole: user.role }, jwtSecret, { expiresIn: maxAge });
                res.cookie("jwt", token, {
                    path: "/", // Cookie is accessible from all paths
                    expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
                    // secure: true, // Cookie will only be sent over HTTPS
                    httpOnly: true, // Cookie cannot be accessed via client-side scripts
                    sameSite: "strict"
                });
                return [2 /*return*/, res.status(200).send({
                        success: true,
                        username: user.username,
                        id: user.id,
                        role: user.role,
                        name: user.name,
                        message: "Signed Up succesfully!"
                    })];
            case 5:
                e_1 = _b.sent();
                console.error(e_1);
                res.status(400).json({
                    success: false,
                    message: e_1
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.register = register;
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, foundUser, _b, token, e_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = req.body, username = _a.username, password = _a.password;
                return [4 /*yield*/, prisma_client_1.default.user.findFirst({
                        where: {
                            username: username
                        }
                    })];
            case 1:
                foundUser = _c.sent();
                _b = !foundUser || !foundUser.password;
                if (_b) return [3 /*break*/, 3];
                return [4 /*yield*/, bcrypt_1.default.compare(password, foundUser.password)];
            case 2:
                _b = !(_c.sent());
                _c.label = 3;
            case 3:
                if (_b)
                    return [2 /*return*/, res.status(404).send({
                            success: false,
                            message: "Invalid credentials"
                        })];
                token = jsonwebtoken_1.default.sign({ userId: foundUser === null || foundUser === void 0 ? void 0 : foundUser.id, userRole: foundUser === null || foundUser === void 0 ? void 0 : foundUser.role }, jwtSecret, { expiresIn: maxAge });
                res.cookie("jwt", token, {
                    path: "/", // Cookie is accessible from all paths
                    expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
                    secure: true, // Cookie will only be sent over HTTPS
                    httpOnly: true, // Cookie cannot be accessed via client-side scripts
                    sameSite: "strict"
                });
                // console.log(token)
                return [2 /*return*/, res.status(200).send({
                        success: true,
                        username: foundUser === null || foundUser === void 0 ? void 0 : foundUser.username,
                        id: foundUser === null || foundUser === void 0 ? void 0 : foundUser.id,
                        role: foundUser === null || foundUser === void 0 ? void 0 : foundUser.role,
                        name: foundUser === null || foundUser === void 0 ? void 0 : foundUser.name,
                        message: "Signed In succesfully!"
                    })];
            case 4:
                e_2 = _c.sent();
                console.error(e_2);
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: e_2
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
var getUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decoded, user, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                token = req.cookies.jwt;
                if (!token) {
                    return [2 /*return*/, res.status(401).send({ success: false, message: "No token provided" })];
                }
                decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
                return [4 /*yield*/, prisma_client_1.default.user.findUnique({
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
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).send({ success: false, message: "User not found" })];
                }
                return [2 /*return*/, res.status(200).send({ success: true, user: user })];
            case 2:
                e_3 = _a.sent();
                console.error(e_3);
                return [2 /*return*/, res.status(400).json({ success: false, message: e_3 })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getUser = getUser;
var signOut = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.clearCookie('jwt', {
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: "strict"
        });
        return [2 /*return*/, res.status(200).send({
                success: true,
                message: "Signed out successfully"
            })];
    });
}); };
exports.signOut = signOut;
function generateUniqueUsername(emailPrefix) {
    var randomString = Math.random().toString(36).substring(2, 8);
    return "".concat(emailPrefix, "_").concat(randomString);
}
var updateUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, oldUsername, username, name_2, checkUser, updateUser_1, token, e_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, oldUsername = _a.oldUsername, username = _a.username, name_2 = _a.name;
                return [4 /*yield*/, prisma_client_1.default.user.findUnique({
                        where: {
                            username: username,
                        }
                    })];
            case 1:
                checkUser = _b.sent();
                if (checkUser && checkUser.username !== oldUsername)
                    return [2 /*return*/, res.status(409).send({
                            success: false,
                            message: "Username already exists"
                        })];
                return [4 /*yield*/, prisma_client_1.default.user.update({
                        where: {
                            username: oldUsername,
                        },
                        data: {
                            username: username,
                            name: name_2,
                        }
                    })];
            case 2:
                updateUser_1 = _b.sent();
                token = jsonwebtoken_1.default.sign({ userId: updateUser_1.id, userRole: updateUser_1.role }, jwtSecret, { expiresIn: maxAge });
                res.cookie("jwt", token, {
                    path: "/", // Cookie is accessible from all paths
                    expires: new Date(Date.now() + maxAge), // Cookie expires in 1 day
                    // secure: true, // Cookie will only be sent over HTTPS
                    httpOnly: true, // Cookie cannot be accessed via client-side scripts
                    sameSite: "strict"
                });
                return [2 /*return*/, res.status(200).send({
                        success: true,
                        username: updateUser_1.username,
                        id: updateUser_1.id,
                        role: updateUser_1.role,
                        name: updateUser_1.name,
                        message: "Profile update successfully!"
                    })];
            case 3:
                e_4 = _b.sent();
                console.error(e_4);
                res.status(400).json({
                    success: false,
                    message: e_4
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateUser = updateUser;
function getAndUpdateUser(email, name) {
    return __awaiter(this, void 0, void 0, function () {
        var emailPrefix, username, existingUser, user, returnedUser, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    emailPrefix = email.split('@')[0];
                    username = generateUniqueUsername(emailPrefix);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, prisma_client_1.default.user.findUnique({
                            where: {
                                username: username,
                            },
                        })];
                case 2:
                    existingUser = _a.sent();
                    _a.label = 3;
                case 3:
                    if (!existingUser) return [3 /*break*/, 5];
                    username = generateUniqueUsername(emailPrefix);
                    return [4 /*yield*/, prisma_client_1.default.user.findUnique({
                            where: {
                                username: username,
                            },
                        })];
                case 4:
                    existingUser = _a.sent();
                    return [3 /*break*/, 3];
                case 5: return [4 /*yield*/, prisma_client_1.default.user.upsert({
                        where: {
                            email: email,
                        },
                        update: {
                            name: name,
                        },
                        create: {
                            name: name,
                            email: email,
                            username: username,
                        },
                    })];
                case 6:
                    user = _a.sent();
                    returnedUser = {
                        success: true,
                        username: user.username,
                        id: user.id,
                        role: user.role,
                        name: user.name,
                        message: "Signed Up succesfully!"
                    };
                    return [2 /*return*/, returnedUser];
                case 7:
                    e_5 = _a.sent();
                    console.log("Unable to check for OAuth Users", e_5.message);
                    throw new Error(e_5.message);
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.getAndUpdateUser = getAndUpdateUser;
function getGoogleOAuthTokens(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var url, values, res, e_6;
        var code = _b.code;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    url = "https://oauth2.googleapis.com/token";
                    values = {
                        code: code,
                        client_id: process.env.GOOGLE_CLIENT_ID,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET,
                        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
                        grant_type: "authorization_code"
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(url, qs_1.default.stringify(values), {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            }
                        })];
                case 2:
                    res = _c.sent();
                    return [2 /*return*/, res.data];
                case 3:
                    e_6 = _c.sent();
                    console.log(e_6, "Failed to fetch Google OAuth Tokens");
                    throw new Error(e_6.message);
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getGoogleOAuthTokens = getGoogleOAuthTokens;
function getGoogleUser(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var res, e_7;
        var id_token = _b.id_token, access_token = _b.access_token;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                            headers: {
                                Authorization: "Bearer ".concat(access_token),
                            }
                        })];
                case 1:
                    res = _c.sent();
                    return [2 /*return*/, res.data];
                case 2:
                    e_7 = _c.sent();
                    console.log(e_7.response.data.error);
                    console.log("Error fetching Google User", e_7.message);
                    // console.log("OOgabooga")
                    throw new Error(e_7.message);
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getGoogleUser = getGoogleUser;
