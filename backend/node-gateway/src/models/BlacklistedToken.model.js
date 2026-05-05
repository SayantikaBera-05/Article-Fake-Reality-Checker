import mongoose from "mongoose";

/**
 * BlacklistedToken Model
 * ──────────────────────
 * Stores JWT tokens that have been explicitly revoked via logout.
 *
 * The `expiresAt` field uses a MongoDB TTL (Time-To-Live) index,
 * which automatically deletes documents once the token's natural
 * expiry time passes. This keeps the collection self-cleaning
 * without needing Redis or a cron job.
 *
 * Flow:
 * 1. User calls POST /api/auth/logout
 * 2. The JWT is decoded to extract its `exp` (expiry) claim
 * 3. The token string + expiry date are saved to this collection
 * 4. The auth middleware checks this collection before authorizing requests
 * 5. MongoDB automatically purges expired entries via the TTL index
 */
const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true, // Fast lookup in auth middleware
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL index — MongoDB will auto-delete documents when `expiresAt` is reached.
// This ensures the collection doesn't grow unboundedly.
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema);
export default BlacklistedToken;
