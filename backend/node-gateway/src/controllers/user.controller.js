import User from "../models/User.model.js";
import VerificationHistory from "../models/VerificationHistory.model.js";
import { logEvent } from "../services/ledger.service.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── Get Full Profile ──────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  // Get verification stats
  const totalVerifications = await VerificationHistory.countDocuments({
    userId: req.user._id,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats: {
        totalVerifications,
      },
    },
  });
});

// ─── Update Profile ────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "avatar", "bio"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  // Audit log
  await logEvent({
    userId: req.user._id,
    action: "profile-update",
    method: "Local",
    status: "success",
    req,
    details: { updatedFields: Object.keys(updates) },
  });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
});

// ─── Change Password ───────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user.password) {
    throw new AppError("Cannot change password for Google OAuth accounts", 400);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  // passwordChangedAt is set automatically by the pre-save hook
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully. Previous sessions have been invalidated.",
  });
});

// ─── Delete Account ────────────────────────────────
export const deleteAccount = asyncHandler(async (req, res) => {
  await logEvent({
    userId: req.user._id,
    action: "account-delete",
    method: "Local",
    status: "success",
    req,
  });

  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});
