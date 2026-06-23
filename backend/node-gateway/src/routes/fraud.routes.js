import { Router } from "express";
import {
  checkFraud,
  getMyReports,
  getReportById,
  deleteReport,
  getFraudStats,
} from "../controllers/fraud.controller.js";
import { checkFraudStream } from "../controllers/sse.controller.js";
import { isAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { fraudCheckSchema } from "../validators/fraud.validator.js";

const router = Router();

// Fraud check supports both authenticated users and guests
router.post("/check", optionalAuth, validate(fraudCheckSchema), checkFraud);

// SSE streaming endpoint — real-time pipeline stage events
router.post("/check/stream", optionalAuth, validate(fraudCheckSchema), checkFraudStream);

// All other fraud routes require authentication
router.get("/reports", isAuth, getMyReports);
router.get("/reports/:id", isAuth, getReportById);
router.delete("/reports/:id", isAuth, deleteReport);
router.get("/stats", isAuth, getFraudStats);

export default router;
