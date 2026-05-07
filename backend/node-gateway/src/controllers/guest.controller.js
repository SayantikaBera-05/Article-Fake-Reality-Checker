import GuestSession from "../models/GuestSession.model.js";
import {
  createGuestSession,
  getGuestHistory,
} from "../services/guest.service.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── Initialize Guest Session ─────────────────────
export const initGuestSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  // Check if session already exists (idempotent)
  const existing = await GuestSession.findOne({ sessionId });
  if (existing) {
    return res.json({
      success: true,
      message: "Guest session already exists",
      data: {
        sessionId: existing.sessionId,
        createdAt: existing.createdAt,
      },
    });
  }

  const session = await createGuestSession(sessionId, req);

  res.status(201).json({
    success: true,
    message: "Guest session initialized",
    data: {
      sessionId: session.sessionId,
      createdAt: session.createdAt,
    },
  });
});

// ─── Get Guest History ────────────────────────────
export const getGuestHistoryHandler = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  // Verify the session exists
  const session = await GuestSession.findOne({ sessionId });
  if (!session) {
    throw new AppError("Guest session not found", 404);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const { history, total } = await getGuestHistory(sessionId, page, limit);

  res.json({
    success: true,
    data: {
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});
