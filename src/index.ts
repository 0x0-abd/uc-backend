// import './types/express';
import http from "http"
import express, { Express, Request, Response } from "express";
import prisma from "../prisma/prisma-client";
import dotenv from "dotenv";
import userRoutes from "./routes/user";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/protected"
import cors from "cors";
import cookieParser from "cookie-parser"
import { UserPayload } from "./middleware/authenticateToken"
import { Server} from "socket.io"

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
dotenv.config();

// const prisma = new PrismaClient()
const app: Express = express();
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", 'https://uc-frontend-five.vercel.app/'],
    methods: ["GET", "POST"],
    credentials: true
  }
})

io.on('connection', (socket) => {
  console.log(`A user connected ${socket.id}`);
  setInterval(() => {
    socket.emit('message', 'Welcome to Universal Chat!');
  }, 5000);

  socket.on('send_message', async (data) => {
    // console.log(data)
    const added = await prisma.message.create({data})
    // console.log(added)
    try{
      const deleted = await prisma.message.delete({ where: {id:added.id-30}})
      // console.log(deleted)
    } catch(e) {
      console.log("No message deleted")
    }
    socket.broadcast.emit("recieve_message", added)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = process.env.PORT;
app.use(cors({
  origin: ['http://localhost:3000', 'https://uc-frontend-five.vercel.app/'],
  credentials: true
}));
app.use(express.json())
app.use(cookieParser())

app.use("/user",userRoutes(prisma));
app.use("/auth",authRoutes(prisma));
app.use("/chat",chatRoutes(prisma));

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Serverrr');
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});