import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Role } from "./types";

interface AuthContextValue {
  user: User | null;
  login: (name: string, email: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "edumark_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as User;
        // migrate old users without email
        if (!parsed.email) parsed.email = "";
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (name: string, email: string, role: Role) => {
    const u: User = { name, email, role };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
