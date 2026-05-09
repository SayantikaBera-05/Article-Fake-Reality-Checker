/**
 * OAuth Success Page
 * ──────────────────
 * Handles the redirect from the backend after a successful Google OAuth login.
 *
 * Flow:
 * 1. Backend redirects to: /oauth-success?token=<jwt>
 * 2. This page extracts the token from the URL search params
 * 3. Saves it to AuthContext (which persists to localStorage)
 * 4. Redirects the user to the dashboard
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenAndHydrate } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      setTokenAndHydrate(token).then(() => {
        navigate("/dashboard", { replace: true });
      });
    } else {
      // No token in URL — something went wrong
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, [searchParams, navigate, setTokenAndHydrate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
