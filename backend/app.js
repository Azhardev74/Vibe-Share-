import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";
import { authRouter } from "./routes/authRoute.js";
import cors from "cors";
import { postRouter } from "./routes/postRoute.js";
const app = express();
connectDB();


const PORT = process.env.PORT || 2999;
app.use(cors({
    origin: ["http://localhost:5173", "https://vibe-share.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
app.use(express.json());

app.use("/api/user", authRouter);
app.use("/api", postRouter);

app.listen(PORT, () => {
    console.log(`Example app listening on http://localhost:${PORT}`)
})
