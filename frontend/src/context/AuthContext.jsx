import { createContext, useContext, useEffect, useState } from "react";
import { decodeJwt } from "../api/jwt";
import { clearTokens, getTokens, setTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [claims, setClaims] = useState(() => decodeJwt(getTokens().access));

  useEffect(() => {
    // Keep state in sync if another tab logs out / refreshes tokens.
    function onStorage() {
      setClaims(decodeJwt(getTokens().access));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function login(accessToken, refreshToken) {
    setTokens(accessToken, refreshToken);
    setClaims(decodeJwt(accessToken));
  }

  function logout() {
    clearTokens();
    setClaims(null);
  }

  const value = {
    isAuthenticated: !!claims,
    userId: claims?.sub ?? null,
    role: claims?.role ?? null,
    gender: claims?.gender ?? null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
