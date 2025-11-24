// src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Route mẫu
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

import mainRouter from "./routes/indexRoute.js";
app.use("/api", mainRouter);

export default app;
