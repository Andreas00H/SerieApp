import { tokenStorage } from "./tokenStorage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError, setUnauthorizedHandler } from "../api/client";
import type { User } from "../api/types";

const TOKEN_KEY = "serieapp_token";

type AuthState = {
  token: string | null;
  user: User | null;
  booting: boolean;
  sessionExpired: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await tokenStorage.get(TOKEN_KEY);
        if (saved) {
          try {
            const data = await api.me(saved);
            setToken(saved);
            setUser(data.user);
          } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
              await tokenStorage.remove(TOKEN_KEY);
              setSessionExpired(true);
            } else {
              setToken(saved);
            }
          }
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void tokenStorage.remove(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setSessionExpired(true);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      booting,
      sessionExpired,
      signIn: async (email, password) => {
        const data = await api.login(email, password);
        await tokenStorage.set(TOKEN_KEY, data.token);
        setSessionExpired(false);
        setToken(data.token);
        setUser(data.user);
      },
      signUp: async (email, password) => {
        await api.register(email, password);
        const data = await api.login(email, password);
        await tokenStorage.set(TOKEN_KEY, data.token);
        setSessionExpired(false);
        setToken(data.token);
        setUser(data.user);
      },
      signOut: async () => {
        await tokenStorage.remove(TOKEN_KEY);
        setSessionExpired(false);
        setToken(null);
        setUser(null);
      }
    }),
    [token, user, booting, sessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}