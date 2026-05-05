import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from 'dotenv';
dotenv.config();

const OAuth2 = google.auth.OAuth2;

/**
 * Creates a Nodemailer transporter using Google OAuth2.
 * Automatically fetches a fresh access token via the refresh token.
 */
const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" // redirect URI used to obtain refresh token
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const { token: accessToken } = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_FROM,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken,
    },
  });
};

/**
 * Send a verification email with a token link.
 */
export const sendVerificationEmail = async (email, token) => {
  const transporter = await createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Fraud Detection Platform" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #e2e8f0; border-radius: 12px;">
        <h1 style="color: #38bdf8; margin-bottom: 16px;">Email Verification</h1>
        <p>Thank you for registering! Please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Verify Email
        </a>
        <p style="font-size: 13px; color: #94a3b8;">This link expires in 24 hours. If you did not create an account, please ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Send a password reset email with a token link.
 */
export const sendPasswordResetEmail = async (email, token) => {
  const transporter = await createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Fraud Detection Platform" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #e2e8f0; border-radius: 12px;">
        <h1 style="color: #f97316; margin-bottom: 16px;">Password Reset</h1>
        <p>We received a request to reset your password. Click below to set a new one:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: linear-gradient(135deg, #f97316, #ef4444); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="font-size: 13px; color: #94a3b8;">This link expires in 1 hour. If you did not request a reset, please ignore this email.</p>
      </div>
    `,
  });
};
