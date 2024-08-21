"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mediaController_1 = require("../controllers/mediaController");
var router = (0, express_1.Router)();
exports.default = (function (prisma) {
    router.post("/upload", mediaController_1.upload, mediaController_1.uploadImage);
    return router;
});
