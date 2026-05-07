import mongoose from "mongoose";

/**
 * GuestSession Model
 * ──────────────────
 * Tracks anonymous guest sessions for users who interact with the
 * verification engine without creating an account.
 *
 * Flow:
 * 1. Frontend generates a UUID and sends POST /api/guest/init
 * 2. A GuestSession document is created with the UUID + client metadata
 * 3. All verification history is linked to this sessionId
 * 4. When the guest registers/logs in, `claimedBy` is set and
 *    all VerificationHistory records are migrated to the user
 * 5. Unclaimed sessions auto-expire after 30 days via TTL index
 */
const guestSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      unique: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

// TTL index — MongoDB auto-deletes documents when `expiresAt` is reached
guestSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const GuestSession = mongoose.model("GuestSession", guestSessionSchema);
export default GuestSession;
