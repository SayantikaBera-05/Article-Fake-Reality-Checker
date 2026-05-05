import crypto from "crypto";
import User from "../models/User.model.js";
import BlacklistedToken from "../models/BlacklistedToken.model.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── Register (Local) ──────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

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
        isEmailVerified: user.isEmailVerified,
      },
      token,
    },
  });
});

// ─── Login (Local) ─────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if this is an OAuth-only account
  if (!user.password) {
    throw new AppError("This account uses Google sign-in. Please log in with Google.", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

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
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      token,
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
    throw new AppError("Invalid or expired verification token", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Email verified successfully",
  });
});

// ─── Forgot Password ──────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether email exists
    return res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(email, resetToken);
  } catch (emailErr) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("Failed to send reset email. Please try again later.", 500);
  }

  res.json({
    success: true,
    message: "If an account with that email exists, a password reset link has been sent.",
  });
});

// ─── Reset Password ───────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const jwtToken = generateToken(user._id);

  res.json({
    success: true,
    message: "Password reset successful",
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

  res.json({
    success: true,
    message: "Logged out successfully. Token has been revoked.",
  });
});
