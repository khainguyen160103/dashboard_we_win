import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type UserRole = "admin" | "user";

export type AuthUser = {
  email: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => AuthUser | null;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "dashboard-auth-user";

const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<AuthUser>;
    if (parsed.email && (parsed.role === "admin" || parsed.role === "user")) {
      return { email: parsed.email, role: parsed.role };
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      return null;
    }

    if (
      normalizedEmail === "admin@example.com" &&
      normalizedPassword === "password"
    ) {
      const adminUser = { email: normalizedEmail, role: "admin" as const };
      setUser(adminUser);
      return adminUser;
    }

    if (normalizedPassword === "password") {
      const regularUser = { email: normalizedEmail, role: "user" as const };
      setUser(regularUser);
      return regularUser;
    }

    return null;
  };

  const logout = () => setUser(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
