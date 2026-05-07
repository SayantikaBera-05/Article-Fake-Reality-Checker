import { Router } from "express";
import {
  initGuestSession,
  getGuestHistoryHandler,
} from "../controllers/guest.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { initGuestSchema } from "../validators/guest.validator.js";

const router = Router();

// Initialize a guest session
router.post("/init", validate(initGuestSchema), initGuestSession);

// Get history for a guest session
router.get("/history", getGuestHistoryHandler);

export default router;
