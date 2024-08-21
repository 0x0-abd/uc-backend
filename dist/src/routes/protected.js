"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
exports.default = (prisma) => {
    router.get("/", authenticateToken_1.authenticateToken, chatController_1.viewChatpage);
    return router;
};
