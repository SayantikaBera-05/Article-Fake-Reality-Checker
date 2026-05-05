import { Router } from "express";
import {
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.use(isAuth);

router.patch("/profile", updateProfile);
router.patch("/change-password", changePassword);
router.delete("/account", deleteAccount);

export default router;
