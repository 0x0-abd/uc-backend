"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authenticateToken_1 = require("../middleware/authenticateToken");
var chatController_1 = require("../controllers/chatController");
var router = (0, express_1.Router)();
exports.default = (function (prisma) {
    router.get("/", authenticateToken_1.authenticateToken, chatController_1.viewChatpage);
    return router;
});
