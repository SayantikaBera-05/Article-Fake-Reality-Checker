import { Router } from "express";
import {
  checkFraud,
  getMyReports,
  getReportById,
  deleteReport,
  getFraudStats,
} from "../controllers/fraud.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { fraudCheckSchema } from "../validators/fraud.validator.js";

const router = Router();

// All fraud routes require authentication
router.use(isAuth);

router.post("/check", validate(fraudCheckSchema), checkFraud);
router.get("/reports", getMyReports);
router.get("/reports/:id", getReportById);
router.delete("/reports/:id", deleteReport);
router.get("/stats", getFraudStats);

export default router;
