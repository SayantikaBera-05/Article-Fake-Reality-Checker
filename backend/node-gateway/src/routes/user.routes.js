import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/user.validator.js";

const router = Router();

// All user routes require authentication
router.use(isAuth);

router.get("/profile", getProfile);
router.patch("/profile", validate(updateProfileSchema), updateProfile);
router.patch("/change-password", validate(changePasswordSchema), changePassword);
router.delete("/account", deleteAccount);

export default router;
