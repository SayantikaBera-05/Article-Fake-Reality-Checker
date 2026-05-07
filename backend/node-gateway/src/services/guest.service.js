import GuestSession from "../models/GuestSession.model.js";
import VerificationHistory from "../models/VerificationHistory.model.js";
import { logEvent } from "./ledger.service.js";

/**
 * Guest Service
 * ─────────────
 * Manages the full guest session lifecycle:
 * creation → history tracking → claim/merge on auth.
 */

/**
 * Create a new guest session.
 *
 * @param {string} sessionId - Client-generated UUID
 * @param {import("express").Request} req - Express request for metadata
 * @returns {Promise<object>} The created GuestSession document
 */
export const createGuestSession = async (sessionId, req) => {
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null;
  const userAgent = req.headers["user-agent"] || null;

  const session = await GuestSession.create({
    sessionId,
    ipAddress,
    userAgent,
  });

  // Audit log
  await logEvent({
    sessionId,
    action: "guest-session-create",
    method: "Guest-Transition",
    status: "success",
    req,
  });

  return session;
};

/**
 * Claim a guest session — migrate all guest data to a permanent user account.
 *
 * Steps:
 * 1. Mark the GuestSession as claimed
 * 2. Bulk-update all VerificationHistory records from this session
 * 3. Log the transition to the audit ledger
 *
 * @param {string} sessionId - The guest session UUID to claim
 * @param {string} userId    - The authenticated user's ObjectId
 * @param {import("express").Request} req - Express request for metadata
 * @returns {Promise<{session: object, migratedCount: number}>}
 */
export const claimGuestSession = async (sessionId, userId, req) => {
  // 1. Mark session as claimed
  const session = await GuestSession.findOneAndUpdate(
    { sessionId, claimedBy: null },
    { claimedBy: userId, claimedAt: new Date() },
    { new: true }
  );

  if (!session) {
    // Session doesn't exist or was already claimed — no-op
    return { session: null, migratedCount: 0 };
  }

  // 2. Migrate all history entries from guest to user
  const migrationResult = await VerificationHistory.updateMany(
    { sessionId, userId: null },
    { $set: { userId } }
  );

  // 3. Audit log
  await logEvent({
    userId,
    sessionId,
    action: "guest-claim",
    method: "Guest-Transition",
    status: "success",
    req,
    details: { migratedCount: migrationResult.modifiedCount },
  });

  return {
    session,
    migratedCount: migrationResult.modifiedCount,
  };
};

/**
 * Get verification history for a guest session.
 *
 * @param {string} sessionId
 * @param {number} [page=1]
 * @param {number} [limit=20]
 * @returns {Promise<{history: object[], total: number}>}
 */
export const getGuestHistory = async (sessionId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    VerificationHistory.find({ sessionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    VerificationHistory.countDocuments({ sessionId }),
  ]);

  return { history, total };
};
