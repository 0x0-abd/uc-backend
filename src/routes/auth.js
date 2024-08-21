"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authController_1 = require("../controllers/authController");
var authenticateToken_1 = require("../middleware/authenticateToken");
var router = (0, express_1.Router)();
exports.default = (function (prisma) {
    router.post("/register", authController_1.register);
    router.post("/login", authController_1.login);
    router.get("/getUser", authController_1.getUser);
    router.post("/signout", authController_1.signOut);
    router.post("/profile", authenticateToken_1.authenticateToken, authController_1.updateUser);
    return router;
});
