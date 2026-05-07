/**
 * API Service Layer
 * ─────────────────
 * Centralized Axios instance with authentication interceptors
 * and typed API helper functions for all backend endpoints.
 *
 * Architecture:
 * ┌─────────────┐    Request Interceptor    ┌──────────────────┐
 * │  React App  │ ──── attaches JWT ──────► │  Node Gateway    │
 * │  (Axios)    │ ◄── catches 401 ──────── │  :5000/api       │
 * └─────────────┘   Response Interceptor    └──────────────────┘
 */

import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

// ─── Axios Instance ────────────────────────────────
// Uses the VITE_API_BASE_URL from the frontend .env file.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://article-fake-reality-checker.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30s — enough for ML processing
});

// ─── Request Interceptor ───────────────────────────
// Attaches the JWT token from localStorage to every outgoing
// request as a Bearer token in the Authorization header.
// Also attaches the guest session ID if present.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach guest session ID for guest-capable routes
    const guestSessionId = localStorage.getItem("guestSessionId");
    if (guestSessionId && config.headers) {
      config.headers["X-Guest-Session-Id"] = guestSessionId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────
// Globally catches 401 Unauthorized responses.
// If the backend rejects a token (expired, blacklisted, invalid),
// this interceptor clears the auth state and redirects to /login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login (avoid redirect loop if already on /login)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);

// ─── TypeScript Interfaces ─────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  bio: string;
  avatar: string | null;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    guestMigration?: {
      migratedCount: number;
    } | null;
  };
}

export interface FraudCheckPayload {
  transactionAmount: number;
  transactionType?: string;
  merchantName?: string;
  merchantCategory?: string;
  cardType?: string;
  location?: string;
  ipAddress?: string;
  deviceId?: string;
  description?: string;
  guestSessionId?: string;
}

export interface FraudResult {
  isFraud: boolean;
  riskScore: number;
  confidenceLevel: "Low" | "Medium" | "High" | "Critical";
  flags: string[];
  analysisSummary: string;
}

export interface FraudReport {
  _id: string;
  userId: string;
  inputData: FraudCheckPayload;
  result: FraudResult;
  status: "pending" | "completed" | "failed" | "under_review";
  createdAt: string;
  updatedAt: string;
}

export interface VerificationHistoryEntry {
  _id: string;
  userId: string | null;
  sessionId: string | null;
  inputType: "text" | "url" | "image";
  inputContent: string;
  result: FraudResult;
  status: "pending" | "completed" | "failed";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  user: User;
  stats: {
    totalVerifications: number;
  };
}

// ─── Auth API ──────────────────────────────────────

export const authAPI = {
  /** Register a new user with email and password */
  register: (name: string, email: string, password: string, guestSessionId?: string) =>
    api.post<AuthResponse>("/auth/register", { name, email, password, guestSessionId }),

  /** Log in with email and password */
  login: (email: string, password: string, guestSessionId?: string) =>
    api.post<AuthResponse>("/auth/login", { email, password, guestSessionId }),

  /** Log out — sends token to backend for blacklisting */
  logout: () => api.post("/auth/logout"),

  /** Get the currently authenticated user's profile */
  getMe: () => api.get<{ success: boolean; data: { user: User } }>("/auth/me"),

  /** Verify email with token */
  verifyEmail: (token: string) =>
    api.post("/auth/verify-email", { token }),

  /** Request password reset email */
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  /** Reset password with token */
  resetPassword: (token: string, password: string) =>
    api.post<{ success: boolean; message: string; data: { token: string } }>(
      "/auth/reset-password",
      { token, password }
    ),
};

// ─── Fraud API ─────────────────────────────────────

export const fraudAPI = {
  /** Submit data for fraud analysis (proxied to Python engine) */
  check: (payload: FraudCheckPayload) =>
    api.post<{ success: boolean; data: FraudReport }>("/fraud/check", payload),

  /** Get paginated list of user's fraud reports */
  getReports: (page = 1, limit = 20) =>
    api.get<{
      success: boolean;
      data: {
        reports: FraudReport[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>("/fraud/reports", { params: { page, limit } }),

  /** Get a single report by ID */
  getReport: (id: string) =>
    api.get<{ success: boolean; data: FraudReport }>(`/fraud/reports/${id}`),

  /** Delete a report */
  deleteReport: (id: string) =>
    api.delete(`/fraud/reports/${id}`),

  /** Get dashboard stats */
  getStats: () =>
    api.get<{
      success: boolean;
      data: {
        totalReports: number;
        fraudulent: number;
        legitimate: number;
        averageRiskScore: number;
        fraudRate: number;
      };
    }>("/fraud/stats"),
};

// ─── User API ──────────────────────────────────────

export const userAPI = {
  /** Get full profile with stats */
  getProfile: () =>
    api.get<{ success: boolean; data: ProfileData }>("/users/profile"),

  /** Update profile fields (name, bio, avatar) */
  updateProfile: (data: { name?: string; bio?: string; avatar?: string }) =>
    api.patch<{ success: boolean; message: string; data: { user: User } }>(
      "/users/profile",
      data
    ),

  /** Change password */
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch("/users/change-password", { currentPassword, newPassword }),

  /** Delete account permanently */
  deleteAccount: () => api.delete("/users/account"),
};

// ─── Guest API ─────────────────────────────────────

export const guestAPI = {
  /** Initialize a guest session */
  init: (sessionId: string) =>
    api.post("/guest/init", { sessionId }),

  /** Get verification history for a guest session */
  getHistory: (sessionId: string, page = 1, limit = 20) =>
    api.get<{
      success: boolean;
      data: {
        history: VerificationHistoryEntry[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>("/guest/history", { params: { sessionId, page, limit } }),
};

export default api;
