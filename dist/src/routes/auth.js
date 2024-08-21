"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authenticateToken_1 = require("../middleware/authenticateToken");
const router = (0, express_1.Router)();
exports.default = (prisma) => {
    router.post("/register", authController_1.register);
    router.post("/login", authController_1.login);
    router.get("/getUser", authController_1.getUser);
    router.post("/signout", authController_1.signOut);
    router.post("/profile", authenticateToken_1.authenticateToken, authController_1.updateUser);
    return router;
};
