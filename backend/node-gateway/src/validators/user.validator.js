import { z } from "zod";

// ─── Update Profile ───────────────────────────────
export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .trim()
      .optional(),
    bio: z
      .string()
      .max(500, "Bio must be at most 500 characters")
      .trim()
      .optional(),
    avatar: z
      .string()
      .url("Avatar must be a valid URL")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "At least one field must be provided" }
  );

// ─── Change Password ──────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be at most 128 characters"),
});
