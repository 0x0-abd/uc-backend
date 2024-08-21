"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediaController_1 = require("../controllers/mediaController");
const router = (0, express_1.Router)();
exports.default = (prisma) => {
    router.post("/upload", mediaController_1.upload, mediaController_1.uploadImage);
    return router;
};
