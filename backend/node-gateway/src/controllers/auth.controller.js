import crypto from "crypto";
import User from "../models/User.model.js";
import BlacklistedToken from "../models/BlacklistedToken.model.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/email.js";
import { initiateReset, executeReset } from "../services/password.service.js";
import { claimGuestSession } from "../services/guest.service.js";
import { logEvent } from "../services/ledger.service.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── Register (Local) ──────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, guestSessionId } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  // Send verification email (fire-and-forget in dev, await in prod)
  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (emailErr) {
    console.error("⚠ Failed to send verification email:", emailErr.message);
  }

  // Claim guest session if one was provided
  let guestMigration = null;
  if (guestSessionId) {
    guestMigration = await claimGuestSession(guestSessionId, user._id, req);
  }

  // Audit log
  await logEvent({
    userId: user._id,
    action: "register",
    method: "Email",
    status: "success",
    req,
    details: guestMigration
      ? { guestSessionClaimed: true, migratedHistory: guestMigration.migratedCount }
      : null,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email to verify your account.",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      guestMigration: guestMigration
        ? { migratedCount: guestMigration.migratedCount }
        : null,
    },
  });
});

// ─── Login (Local) ─────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password, guestSessionId } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    await logEvent({
      action: "login",
      method: "Email",
      status: "failure",
      req,
      details: { reason: "Invalid email" },
    });
    throw new AppError("Invalid email or password", 401);
  }

  // Check if this is an OAuth-only account
  if (!user.password) {
    throw new AppError("This account uses Google sign-in. Please log in with Google.", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await logEvent({
      userId: user._id,
      action: "login",
      method: "Email",
      status: "failure",
      req,
      details: { reason: "Wrong password" },
    });
    throw new AppError("Invalid email or password", 401);
  }

  // Claim guest session if one was provided
  let guestMigration = null;
  if (guestSessionId) {
    guestMigration = await claimGuestSession(guestSessionId, user._id, req);
  }

  // Audit log
  await logEvent({
    userId: user._id,
    action: "login",
    method: "Email",
    status: "success",
    req,
    details: guestMigration
      ? { guestSessionClaimed: true, migratedHistory: guestMigration.migratedCount }
      : null,
  });

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      guestMigration: guestMigration
        ? { migratedCount: guestMigration.migratedCount }
        : null,
    },
  });
});

// ─── Verify Email ──────────────────────────────────
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    await logEvent({
      action: "email-verify",
      method: "Email",
      status: "failure",
      req,
      details: { reason: "Invalid or expired verification token" },
    });
    throw new AppError("Invalid or expired verification token", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  await logEvent({
    userId: user._id,
    action: "email-verify",
    method: "Email",
    status: "success",
    req,
  });

  res.json({
    success: true,
    message: "Email verified successfully",
  });
});

// ─── Forgot Password ──────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Delegate to the password service (handles hashing, email, logging)
  await initiateReset(email, req);

  // Always return the same message (anti-enumeration)
  res.json({
    success: true,
    message: "If an account with that email exists, a password reset link has been sent.",
  });
});

// ─── Reset Password ───────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Delegate to the password service (validates token, updates password,
  // sets passwordChangedAt, logs to ledger)
  const user = await executeReset(token, password, req);

  const jwtToken = generateToken(user._id);

  res.json({
    success: true,
    message: "Password reset successful. All previous sessions have been invalidated.",
    data: { token: jwtToken },
  });
});

// ─── Get Current User ──────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

// ─── Logout (Blacklist Token) ──────────────────────
// Adds the current JWT to the blacklist collection.
// The auth middleware will reject any subsequent requests
// using this token, even if it hasn't expired yet.
export const logout = asyncHandler(async (req, res) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new AppError("No token provided", 400);
  }

  // Decode the token to get its expiry time (without re-verifying,
  // since isAuth middleware already verified it)
  const decoded = verifyToken(token);
  const expiresAt = new Date(decoded.exp * 1000); // JWT exp is in seconds

  // Add to blacklist — the TTL index on the model will auto-delete
  // this document once the original token expiry time is reached.
  await BlacklistedToken.create({ token, expiresAt });

  // Audit log
  await logEvent({
    userId: req.user._id,
    action: "logout",
    method: "Local",
    status: "success",
    req,
  });

  res.json({
    success: true,
    message: "Logged out successfully. Token has been revoked.",
  });
});
