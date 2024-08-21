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
// import './types/express';
var http_1 = require("http");
var express_1 = require("express");
var prisma_client_1 = require("../prisma/prisma-client");
var dotenv_1 = require("dotenv");
var user_1 = require("./routes/user");
var auth_1 = require("./routes/auth");
var protected_1 = require("./routes/protected");
var media_1 = require("./routes/media");
var sessions_1 = require("./routes/sessions");
var cors_1 = require("cors");
var cookie_parser_1 = require("cookie-parser");
var socket_io_1 = require("socket.io");
var mediaController_1 = require("./controllers/mediaController");
dotenv_1.default.config();
// const prisma = new PrismaClient()
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
io.on('connection', function (socket) {
    console.log("A user connected ".concat(socket.id));
    setInterval(function () {
        socket.emit('message', 'Welcome to Universal Chat!');
    }, 5000);
    socket.on('send_message', function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, e_1, added, deleted, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!data.imageId) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = data;
                    return [4 /*yield*/, (0, mediaController_1.getImageUrl)(data.imageId)];
                case 2:
                    _a.imageId = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    console.log(e_1);
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, prisma_client_1.default.message.create({ data: data })
                    // console.log(added)
                ];
                case 5:
                    added = _b.sent();
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 10, , 11]);
                    return [4 /*yield*/, prisma_client_1.default.message.delete({ where: { id: added.id - 30 } })];
                case 7:
                    deleted = _b.sent();
                    if (!deleted.imageId) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, mediaController_1.deleteImage)(deleted.imageId)];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    e_2 = _b.sent();
                    console.log("No message deleted");
                    return [3 /*break*/, 11];
                case 11:
                    // console.log(added)
                    socket.broadcast.emit("recieve_message", added);
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on('disconnect', function () {
        console.log('User disconnected');
    });
});
var port = process.env.PORT;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/user", (0, user_1.default)(prisma_client_1.default));
app.use("/auth", (0, auth_1.default)(prisma_client_1.default));
app.use("/chat", (0, protected_1.default)(prisma_client_1.default));
app.use("/sessions", sessions_1.default);
app.use("/media", (0, media_1.default)(prisma_client_1.default));
app.get('/', function (req, res) {
    res.send('Express + TypeScript Serverrr');
});
server.listen(port, function () {
    console.log("[server]: Server is running at http://localhost:".concat(port));
});
