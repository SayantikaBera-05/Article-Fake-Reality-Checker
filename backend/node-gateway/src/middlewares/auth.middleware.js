import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.model.js";
import BlacklistedToken from "../models/BlacklistedToken.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Protect routes — verifies JWT from Authorization header
 * and attaches the user document to `req.user`.
 *
 * Also checks the token blacklist to reject revoked tokens
 * (e.g., tokens from logged-out sessions).
 */
const isAuth = asyncHandler(async (req, _res, next) => {
  let token;

  // Extract token from "Bearer <token>"
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized — no token provided", 401);
  }

  try {
    const decoded = verifyToken(token);

    // ─── Blacklist Check ─────────────────────────────
    // If this token was explicitly revoked via POST /auth/logout,
    // it will exist in the BlacklistedToken collection.
    const isBlacklisted = await BlacklistedToken.exists({ token });
    if (isBlacklisted) {
      throw new AppError("Token has been revoked. Please log in again.", 401);
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new AppError("User belonging to this token no longer exists", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid token", 401);
    }
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token has expired, please log in again", 401);
    }
    throw error;
  }
});

/**
 * Restrict access to specific roles.
 * @param  {...string} roles - Allowed roles (e.g. "admin")
 */
const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  };
};

export { isAuth, restrictTo };
