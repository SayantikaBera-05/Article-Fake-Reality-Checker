import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport";

import dotenv from 'dotenv';
dotenv.config();

import "./config/passport.js"; // Initialize Passport strategies

import authRoutes from "./routes/auth.routes.js";
import fraudRoutes from "./routes/fraud.routes.js";
import userRoutes from "./routes/user.routes.js";
import guestRoutes from "./routes/guest.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { sanitizeInput } from "./middlewares/sanitize.middleware.js";

const app = express();

// ─── Security ──────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Guest-Session-Id"],
  })
);

// ─── Rate Limiting ─────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ─── Body Parsing ──────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Input Sanitization ───────────────────────────
app.use(sanitizeInput);

// ─── Passport ──────────────────────────────────────
app.use(passport.initialize());

// ─── Health Check ──────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "node-gateway", timestamp: new Date().toISOString() });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "node-gateway", timestamp: new Date().toISOString() });
});

// ─── Routes ────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/users", userRoutes);
app.use("/api/guest", guestRoutes);

// ─── Error Handling ────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
