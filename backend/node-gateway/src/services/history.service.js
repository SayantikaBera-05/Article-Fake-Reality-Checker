import VerificationHistory from "../models/VerificationHistory.model.js";

/**
 * History Service
 * ───────────────
 * Manages context-aware verification history for both
 * authenticated users and anonymous guest sessions.
 */

/**
 * Create a new verification history entry.
 *
 * @param {object} data
 * @param {string} [data.userId]       - User's ObjectId (authenticated)
 * @param {string} [data.sessionId]    - Guest session UUID (anonymous)
 * @param {string} data.inputType      - "text", "url", or "image"
 * @param {string} data.inputContent   - The submitted content
 * @param {object} [data.result]       - Analysis result (FraudResult shape)
 * @param {string} [data.status]       - "completed", "failed", "pending"
 * @param {object} [data.metadata]     - Additional context
 * @returns {Promise<object>} The created document
 */
export const createHistoryEntry = async (data) => {
  return VerificationHistory.create({
    userId: data.userId || null,
    sessionId: data.sessionId || null,
    inputType: data.inputType,
    inputContent: data.inputContent,
    result: data.result || {},
    status: data.status || "completed",
    metadata: data.metadata || {},
  });
};

/**
 * Get paginated history for an authenticated user.
 *
 * @param {string} userId
 * @param {number} [page=1]
 * @param {number} [limit=20]
 * @returns {Promise<{history: object[], pagination: object}>}
 */
export const getUserHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    VerificationHistory.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    VerificationHistory.countDocuments({ userId }),
  ]);

  return {
    history,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Merge guest session history into a user's account.
 * Bulk-updates all VerificationHistory records where sessionId matches
 * and userId is not yet set.
 *
 * @param {string} sessionId - Guest session UUID
 * @param {string} userId    - Target user's ObjectId
 * @returns {Promise<number>} Number of records migrated
 */
export const mergeGuestHistory = async (sessionId, userId) => {
  const result = await VerificationHistory.updateMany(
    { sessionId, userId: null },
    { $set: { userId } }
  );
  return result.modifiedCount;
};
