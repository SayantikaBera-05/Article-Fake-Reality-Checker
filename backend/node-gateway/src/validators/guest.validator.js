import { z } from "zod";

// ─── Initialize Guest Session ─────────────────────
export const initGuestSchema = z.object({
  sessionId: z
    .string({ required_error: "Session ID is required" })
    .uuid("Session ID must be a valid UUID"),
});

// ─── Get Guest History ────────────────────────────
export const guestHistorySchema = z.object({
  sessionId: z
    .string({ required_error: "Session ID is required" })
    .uuid("Session ID must be a valid UUID"),
});
