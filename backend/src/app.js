// src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// Middleware cơ bản
app.use(cors({origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
// Route mẫu
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

import mainRouter from "./routes/indexRoute.js";
app.use("/api", mainRouter);

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
export default app;
