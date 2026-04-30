import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";
import { authRouter } from "./routes/authRoute.js";
import cors from "cors";
import { postRouter } from "./routes/postRoute.js";

const app = express();
const server = http.createServer(app);

// Socket Setup
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://vibe-share.netlify.app"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true

    }
});

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});

// DB
connectDB();

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://vibe-share.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/user", authRouter);
app.use("/api", postRouter);

// Start server
const PORT = process.env.PORT || 2999;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// 🔥 Export io
export { io };