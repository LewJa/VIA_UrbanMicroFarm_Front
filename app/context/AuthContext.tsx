import { createContext, useContext, useState, type ReactNode } from "react";
import type { UserProfile } from "~/model/user/types";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  theme: "light" | "dark" | "system";
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, profile: UserProfile) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredUser = (): AuthUser | null => {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
  );
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const login = (newToken: string, profile: UserProfile) => {
    const authUser: AuthUser = {
      id: profile.id,
      email: profile.email,
      name: "",
      theme: profile.theme,
    };
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(authUser));
    setToken(newToken);
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
