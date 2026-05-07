import mongoose from "mongoose";

/**
 * VerificationLedger Model
 * ────────────────────────
 * Immutable audit trail for all authentication and verification events.
 *
 * Every login, registration, password reset, email verification,
 * guest session creation, and guest-claim transition is logged here
 * with full client metadata for security forensics.
 *
 * This collection is append-only — entries should never be modified
 * or deleted (except by automated retention policies).
 */
const verificationLedgerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  sessionId: {
    type: String,
    default: null,
  },
  action: {
    type: String,
    required: [true, "Action is required"],
    enum: [
      "login",
      "register",
      "logout",
      "password-reset-request",
      "password-reset-complete",
      "email-verify",
      "guest-session-create",
      "guest-claim",
      "profile-update",
      "account-delete",
    ],
  },
  method: {
    type: String,
    enum: ["Email", "Google", "Guest-Transition", "Password-Reset", "Local"],
    default: "Local",
  },
  status: {
    type: String,
    enum: ["success", "failure"],
    required: [true, "Status is required"],
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// ─── Indexes ────────────────────────────────────────
verificationLedgerSchema.index({ userId: 1, timestamp: -1 });
verificationLedgerSchema.index({ sessionId: 1, timestamp: -1 });
verificationLedgerSchema.index({ action: 1, timestamp: -1 });

const VerificationLedger = mongoose.model(
  "VerificationLedger",
  verificationLedgerSchema
);
export default VerificationLedger;
