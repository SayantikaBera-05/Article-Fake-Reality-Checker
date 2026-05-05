/**
 * Authentication Context
 * ──────────────────────
 * Manages global authentication state across the React app.
 *
 * Flow:
 * 1. On mount → checks localStorage for a token → if found, calls GET /auth/me to hydrate user state
 * 2. login()  → POST /auth/login → stores token + sets user state
 * 3. register() → POST /auth/register → stores token + sets user state
 * 4. logout() → POST /auth/logout (blacklists token on backend) → clears localStorage + state
 *
 * The 401 interceptor in services/api.ts handles forced logouts (expired/blacklisted tokens)
 * independently — this context handles intentional logouts.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authAPI, type User } from "../services/api";

// ─── TypeScript Interfaces ─────────────────────────

interface AuthContextType {
  /** The currently authenticated user (null if logged out) */
  user: User | null;
  /** The JWT token string (null if logged out) */
  token: string | null;
  /** Quick boolean check for auth status */
  isAuthenticated: boolean;
  /** True while the context is hydrating user state on initial load */
  isLoading: boolean;
  /** Log in with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Register a new account */
  register: (name: string, email: string, password: string) => Promise<void>;
  /** Log out — blacklists token on backend, clears all state */
  logout: () => Promise<void>;
  /** Manually set token (used by OAuth success page) */
  setTokenAndHydrate: (token: string) => Promise<void>;
}

// ─── Context ───────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token") // Initialize from localStorage
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!user && !!token;

  /**
   * Hydrate user state from the backend using the stored token.
   * Called on initial mount and after OAuth callback.
   */
  const hydrateUser = useCallback(async (currentToken: string) => {
    try {
      // Token is already in localStorage, and the axios interceptor
      // will attach it automatically to this request.
      const response = await authAPI.getMe();
      setUser(response.data.data.user);
    } catch {
      // Token is invalid or expired — clean up
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }, []);

  /**
   * On initial mount: if a token exists in localStorage, validate it
   * by fetching the current user profile from the backend.
   */
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await hydrateUser(token);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Login: POST /auth/login → save token → set user state.
   */
  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const { token: newToken, user: userData } = response.data.data;

    // Persist token for future sessions
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }, []);

  /**
   * Register: POST /auth/register → save token → set user state.
   */
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await authAPI.register(name, email, password);
      const { token: newToken, user: userData } = response.data.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
    },
    []
  );

  /**
   * Logout: POST /auth/logout (blacklists the token on the backend)
   * → clear localStorage → clear state.
   *
   * The backend adds the current JWT to its blacklist collection,
   * preventing it from being used again even if not yet expired.
   */
  const logout = useCallback(async () => {
    try {
      // Send the token to the backend to be blacklisted.
      // The axios interceptor automatically attaches the Bearer token.
      await authAPI.logout();
    } catch {
      // Even if the API call fails (e.g., network error),
      // we still clear the client-side state for security.
      console.warn("Backend logout failed, clearing local state anyway.");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }, []);

  /**
   * Set a token directly (used by OAuth callback page) and hydrate user state.
   */
  const setTokenAndHydrate = useCallback(
    async (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      await hydrateUser(newToken);
    },
    [hydrateUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        setTokenAndHydrate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Custom Hook ───────────────────────────────────

/**
 * Hook to access authentication state and actions.
 * Must be used within an <AuthProvider>.
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
