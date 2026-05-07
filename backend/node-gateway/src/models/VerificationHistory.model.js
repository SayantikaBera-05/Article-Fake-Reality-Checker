import mongoose from "mongoose";

/**
 * VerificationHistory Model
 * ─────────────────────────
 * Context-aware history that works for both authenticated users
 * and anonymous guest sessions.
 *
 * - Logged-in users: `userId` is set, `sessionId` is null
 * - Guest users: `sessionId` is set, `userId` is null
 * - After guest-claim: both `userId` and `sessionId` are set
 *
 * This model replaces direct reliance on FraudReport for history
 * display, providing a unified view regardless of auth state.
 */
const verificationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      sparse: true,
    },
    sessionId: {
      type: String,
      default: null,
      sparse: true,
    },
    inputType: {
      type: String,
      enum: ["text", "url", "image"],
      required: [true, "Input type is required"],
    },
    inputContent: {
      type: String,
      required: [true, "Input content is required"],
      maxlength: 10000,
    },
    result: {
      isFraud: { type: Boolean },
      riskScore: { type: Number, min: 0, max: 100 },
      confidenceLevel: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
      },
      flags: { type: [String], default: [] },
      analysisSummary: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────
verificationHistorySchema.index({ userId: 1, createdAt: -1 });
verificationHistorySchema.index({ sessionId: 1, createdAt: -1 });

const VerificationHistory = mongoose.model(
  "VerificationHistory",
  verificationHistorySchema
);
export default VerificationHistory;
