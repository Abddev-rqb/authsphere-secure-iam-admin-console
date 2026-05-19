import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { http } from "../api/http";
import type { AuthUser, LoginResponse, PermissionCode } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: PermissionCode) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = "authsphere_access_token";
const REFRESH_TOKEN_KEY = "authsphere_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadCurrentUser() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await http.get<AuthUser>("/api/auth/me/");
      setUser(response.data);
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function login(username: string, password: string) {
    const response = await http.post<LoginResponse>("/api/auth/login/", {
      username,
      password,
    });

    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);

    setUser(response.data.user);
  }

  async function logout() {
    try {
      await http.post("/api/auth/logout/");
    } catch {
      // Logout should still clear local auth state even if server call fails.
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  }

  function hasPermission(permission: PermissionCode) {
    if (!user) return false;
    if (user.is_superuser) return true;

    return user.roles.some((role) => role.permissions.includes(permission));
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      hasPermission,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
