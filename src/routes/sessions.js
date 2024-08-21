"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var sessionController_1 = require("../controllers/sessionController");
var router = (0, express_1.Router)();
router.get("/oauth/google", sessionController_1.googleOAuthHandler);
exports.default = router;
