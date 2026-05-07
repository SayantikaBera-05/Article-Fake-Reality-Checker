import { z } from "zod";

// ─── Fraud Check Input ─────────────────────────────
export const fraudCheckSchema = z.object({
  transactionAmount: z
    .number({ required_error: "Transaction amount is required" })
    .positive("Amount must be positive"),
  transactionType: z
    .string()
    .optional(),
  merchantName: z
    .string()
    .optional(),
  merchantCategory: z
    .string()
    .optional(),
  cardType: z
    .string()
    .optional(),
  location: z
    .string()
    .optional(),
  ipAddress: z
    .string()
    .optional(),
  deviceId: z
    .string()
    .optional(),
  description: z
    .string()
    .max(5000, "Description must be at most 5000 characters")
    .optional(),
  metadata: z
    .record(z.unknown())
    .optional(),
  guestSessionId: z
    .string()
    .uuid()
    .optional(),
});
