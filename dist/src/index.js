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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import './types/express';
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const prisma_client_1 = __importDefault(require("../prisma/prisma-client"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
const protected_1 = __importDefault(require("./routes/protected"));
const media_1 = __importDefault(require("./routes/media"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_io_1 = require("socket.io");
const mediaController_1 = require("./controllers/mediaController");
dotenv_1.default.config();
// const prisma = new PrismaClient()
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "https://uc-frontend-five.vercel.app",
        methods: ["GET", "POST"],
        credentials: true
    }
});
io.on('connection', (socket) => {
    console.log(`A user connected ${socket.id}`);
    setInterval(() => {
        socket.emit('message', 'Welcome to Universal Chat!');
    }, 5000);
    socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log(data)
        if (data.imageId) {
            // console.log(data.imageId)
            try {
                data.imageId = yield (0, mediaController_1.getImageUrl)(data.imageId);
            }
            catch (e) {
                console.log(e);
            }
        }
        const added = yield prisma_client_1.default.message.create({ data });
        // console.log(added)
        try {
            const deleted = yield prisma_client_1.default.message.delete({ where: { id: added.id - 30 } });
            if (deleted.imageId)
                yield (0, mediaController_1.deleteImage)(deleted.imageId);
        }
        catch (e) {
            console.log("No message deleted");
        }
        // console.log(added)
        socket.broadcast.emit("recieve_message", added);
    }));
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
const port = process.env.PORT;
app.use((0, cors_1.default)({
    origin: 'https://uc-frontend-five.vercel.app',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/user", (0, user_1.default)(prisma_client_1.default));
app.use("/auth", (0, auth_1.default)(prisma_client_1.default));
app.use("/chat", (0, protected_1.default)(prisma_client_1.default));
app.use("/sessions", sessions_1.default);
app.use("/media", (0, media_1.default)(prisma_client_1.default));
app.get('/', (req, res) => {
    res.send('Express + TypeScript Serverrr');
});
server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
