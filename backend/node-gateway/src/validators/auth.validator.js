import { z } from "zod";


// ─── Registration ──────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be at most 128 characters"),
  guestSessionId: z.string().uuid().optional(),
});

// ─── Login ─────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
  guestSessionId: z.string().uuid().optional(),
});

// ─── Forgot Password ──────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
});

// ─── Reset Password ───────────────────────────────
export const resetPasswordSchema = z.object({
  token: z.string({ required_error: "Reset token is required" }),
  password: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be at most 128 characters"),
});

// ─── Verify Email ──────────────────────────────────
export const verifyEmailSchema = z.object({
  token: z.string({ required_error: "Verification token is required" }),
});
