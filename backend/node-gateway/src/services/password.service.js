import crypto from "crypto";
import User from "../models/User.model.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { logEvent } from "./ledger.service.js";
import AppError from "../utils/AppError.js";

/**
 * Password Service
 * ────────────────
 * Handles the hardened password reset flow:
 *   1. Hash tokens before storing (so a DB leak doesn't expose reset links)
 *   2. Set `passwordChangedAt` to invalidate all existing sessions
 *   3. Full audit logging via the ledger service
 */

/**
 * Hash a raw reset token using SHA-256.
 * The raw token is sent via email; only the hash is stored in DB.
 */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Initiate a password reset.
 * Generates a reset token, hashes it, stores the hash + expiry on the user,
 * and sends the raw token via email.
 *
 * Always returns the same response message regardless of whether the email
 * exists (anti-enumeration).
 *
 * @param {string} email
 * @param {import("express").Request} req - For audit logging
 */
export const initiateReset = async (email, req) => {
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal whether email exists — log the attempt
    await logEvent({
      action: "password-reset-request",
      method: "Password-Reset",
      status: "failure",
      req,
      details: { reason: "Email not found (not revealed to client)" },
    });
    return;
  }

  // Generate a raw token and hash it for storage
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(email, rawToken);
    await logEvent({
      userId: user._id,
      action: "password-reset-request",
      method: "Password-Reset",
      status: "success",
      req,
    });
  } catch (emailErr) {
    // Rollback token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await logEvent({
      userId: user._id,
      action: "password-reset-request",
      method: "Password-Reset",
      status: "failure",
      req,
      details: { reason: emailErr.message },
    });

    throw new AppError(
      "Failed to send reset email. Please try again later.",
      500
    );
  }
};

/**
 * Execute a password reset.
 * Validates the hashed token + expiry, updates the password,
 * and sets `passwordChangedAt` to invalidate all existing sessions.
 *
 * @param {string} rawToken - The raw token from the reset URL
 * @param {string} newPassword - The new password (will be hashed by pre-save hook)
 * @param {import("express").Request} req - For audit logging
 * @returns {Promise<object>} The updated user document
 */
export const executeReset = async (rawToken, newPassword, req) => {
  const hashedToken = hashToken(rawToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    await logEvent({
      action: "password-reset-complete",
      method: "Password-Reset",
      status: "failure",
      req,
      details: { reason: "Invalid or expired token" },
    });
    throw new AppError("Invalid or expired reset token", 400);
  }

  // Update password — the pre-save hook hashes it and sets passwordChangedAt
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // Explicitly set passwordChangedAt for new-user edge case
  user.passwordChangedAt = new Date();
  await user.save();

  await logEvent({
    userId: user._id,
    action: "password-reset-complete",
    method: "Password-Reset",
    status: "success",
    req,
  });

  return user;
};
