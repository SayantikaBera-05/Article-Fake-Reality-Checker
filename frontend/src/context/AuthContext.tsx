/**
 * Authentication Context
 * ──────────────────────
 * Manages global authentication state across the React app,
 * including guest session management for anonymous users.
 *
 * Flow:
 * 1. On mount → checks localStorage for a token → if found, calls GET /auth/me to hydrate user state
 * 2. If no token → generates a guest session UUID and registers it with the backend
 * 3. login()  → POST /auth/login (with guestSessionId) → stores token + sets user state
 * 4. register() → POST /auth/register (with guestSessionId) → stores token + sets user state
 * 5. logout() → POST /auth/logout (blacklists token on backend) → clears localStorage + state
 *
 * Guest sessions are automatically claimed on login/register,
 * merging all guest verification history into the user's account.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authAPI, guestAPI, type User } from "../services/api";

// ─── TypeScript Interfaces ─────────────────────────

interface AuthContextType {
  /** The currently authenticated user (null if logged out) */
  user: User | null;
  /** The JWT token string (null if logged out) */
  token: string | null;
  /** Quick boolean check for auth status */
  isAuthenticated: boolean;
  /** True when user is in guest mode */
  isGuest: boolean;
  /** The guest session UUID (null if authenticated) */
  guestSessionId: string | null;
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

// ─── UUID Generator ────────────────────────────────

const generateUUID = (): string => {
  return crypto.randomUUID();
};

// ─── Provider ──────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token") // Initialize from localStorage
  );
  const [guestSessionId, setGuestSessionId] = useState<string | null>(
    () => localStorage.getItem("guestSessionId")
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!user && !!token;
  const isGuest = !isAuthenticated && !!guestSessionId;

  /**
   * Hydrate user state from the backend using the stored token.
   * Called on initial mount and after OAuth callback.
   */
  const hydrateUser = useCallback(async (_currentToken: string) => {
    try {
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
   * Initialize guest session if no auth token is present.
   */
  const initGuestSession = useCallback(async () => {
    let sessionId = localStorage.getItem("guestSessionId");

    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem("guestSessionId", sessionId);
    }

    setGuestSessionId(sessionId);

    try {
      await guestAPI.init(sessionId);
    } catch {
      // Guest init failure is non-critical — the session still works locally
      console.warn("Failed to register guest session with backend.");
    }
  }, []);

  /**
   * On initial mount: if a token exists, validate it.
   * Otherwise, initialize a guest session.
   */
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await hydrateUser(token);
      } else {
        await initGuestSession();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Login: POST /auth/login → save token → set user state.
   * If a guest session exists, sends it for claiming/merging.
   */
  const login = useCallback(
    async (email: string, password: string) => {
      const currentGuestId = localStorage.getItem("guestSessionId") || undefined;
      const response = await authAPI.login(email, password, currentGuestId);
      const { token: newToken, user: userData } = response.data.data;

      // Persist token for future sessions
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Clear guest session — it has been claimed by the backend
      localStorage.removeItem("guestSessionId");
      setGuestSessionId(null);

      setToken(newToken);
      setUser(userData);
    },
    []
  );

  /**
   * Register: POST /auth/register → save token → set user state.
   * If a guest session exists, sends it for claiming/merging.
   */
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const currentGuestId = localStorage.getItem("guestSessionId") || undefined;
      const response = await authAPI.register(name, email, password, currentGuestId);
      const { token: newToken, user: userData } = response.data.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Clear guest session
      localStorage.removeItem("guestSessionId");
      setGuestSessionId(null);

      setToken(newToken);
      setUser(userData);
    },
    []
  );

  /**
   * Logout: POST /auth/logout (blacklists the token on the backend)
   * → clear localStorage → clear state → re-initialize guest session.
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      console.warn("Backend logout failed, clearing local state anyway.");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);

      // Re-initialize a fresh guest session
      await initGuestSession();
    }
  }, [initGuestSession]);

  /**
   * Set a token directly (used by OAuth callback page) and hydrate user state.
   */
  const setTokenAndHydrate = useCallback(
    async (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);

      // Clear guest session if present
      localStorage.removeItem("guestSessionId");
      setGuestSessionId(null);

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
        isGuest,
        guestSessionId,
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
 * const { user, isAuthenticated, isGuest, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
