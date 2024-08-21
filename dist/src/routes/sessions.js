"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const router = (0, express_1.Router)();
router.get("/oauth/google", sessionController_1.googleOAuthHandler);
exports.default = router;
