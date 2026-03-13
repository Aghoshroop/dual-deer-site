"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface User {
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "dualdeer_user";
const ACCOUNTS_KEY = "dualdeer_accounts";

interface StoredAccount {
  name: string;
  email: string;
  password: string; // In production: hashed. Here: plain for demo.
  createdAt: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const getAccounts = (): StoredAccount[] => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const login = useCallback((email: string, password: string) => {
    const accounts = getAccounts();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) return { success: false, error: "Invalid email or password." };

    const loggedIn: User = { name: account.name, email: account.email, createdAt: account.createdAt };
    setUser(loggedIn);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedIn));
    return { success: true };
  }, []);

  const register = useCallback((name: string, email: string, password: string) => {
    const accounts = getAccounts();
    if (accounts.find((a) => a.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." };
    }
    const newAccount: StoredAccount = {
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    accounts.push(newAccount);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

    const loggedIn: User = { name, email, createdAt: newAccount.createdAt };
    setUser(loggedIn);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedIn));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
