import VerificationLedger from "../models/VerificationLedger.model.js";

/**
 * Ledger Service
 * ──────────────
 * Provides a single entry point for logging all auth/verification
 * events to the immutable audit trail.
 *
 * Usage:
 *   import { logEvent } from "../services/ledger.service.js";
 *   await logEvent({ userId, action: "login", method: "Email", status: "success", req });
 */

/**
 * Extract client metadata from an Express request.
 * @param {import("express").Request} req
 */
const extractClientInfo = (req) => ({
  ipAddress:
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null,
  userAgent: req.headers["user-agent"] || null,
});

/**
 * Log an event to the VerificationLedger.
 *
 * @param {object} data
 * @param {string} [data.userId]       - MongoDB ObjectId (null for guests)
 * @param {string} [data.sessionId]    - Guest session UUID
 * @param {string} data.action         - Event type (login, register, etc.)
 * @param {string} [data.method]       - Auth method (Email, Google, etc.)
 * @param {string} data.status         - "success" or "failure"
 * @param {import("express").Request} [data.req] - Express request for auto-extracting IP/UA
 * @param {string} [data.ipAddress]    - Override IP (if req is unavailable)
 * @param {string} [data.userAgent]    - Override UA (if req is unavailable)
 * @param {object} [data.details]      - Extra context (error messages, etc.)
 */
export const logEvent = async (data) => {
  try {
    const clientInfo = data.req ? extractClientInfo(data.req) : {};

    await VerificationLedger.create({
      userId: data.userId || null,
      sessionId: data.sessionId || null,
      action: data.action,
      method: data.method || "Local",
      status: data.status,
      ipAddress: data.ipAddress || clientInfo.ipAddress || null,
      userAgent: data.userAgent || clientInfo.userAgent || null,
      details: data.details || null,
    });
  } catch (err) {
    // Ledger writes should never block the main flow
    console.error("⚠ Ledger write failed:", err.message);
  }
};
