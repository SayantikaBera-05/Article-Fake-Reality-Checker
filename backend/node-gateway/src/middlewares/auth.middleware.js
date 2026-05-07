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
 * (e.g., tokens from logged-out sessions) and validates
 * `passwordChangedAt` to reject tokens issued before a
 * password change.
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

    // ─── Password Changed Check ──────────────────────
    // Reject tokens issued before the last password change.
    // This invalidates ALL active sessions after a password reset.
    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        user.passwordChangedAt.getTime() / 1000
      );
      if (decoded.iat < changedTimestamp) {
        throw new AppError(
          "Password was recently changed. Please log in again.",
          401
        );
      }
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
 * Optional authentication middleware.
 * Attaches `req.user` if a valid token is present, but does NOT
 * throw if no token is provided — allows guest access to the route.
 *
 * Used for routes that support both authenticated and guest users
 * (e.g., the fraud check endpoint).
 */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);

    const isBlacklisted = await BlacklistedToken.exists({ token });
    if (isBlacklisted) {
      req.user = null;
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      req.user = null;
      return next();
    }

    // Password changed check
    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        user.passwordChangedAt.getTime() / 1000
      );
      if (decoded.iat < changedTimestamp) {
        req.user = null;
        return next();
      }
    }

    req.user = user;
  } catch {
    // Any JWT error — treat as guest
    req.user = null;
  }

  next();
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

export { isAuth, optionalAuth, restrictTo };
