import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, logout as apiLogout, updateProfile } from "@/lib/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setReady(true);
  }, []);

  const refresh = useCallback(() => setUser(getCurrentUser()), []);

  const signOut = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const patchProfile = useCallback(
    async (patch) => {
      if (!user) return;
      const updated = await updateProfile(user.id, patch);
      setUser(updated);
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, ready, setUser, refresh, signOut, patchProfile }),
    [user, ready, refresh, signOut, patchProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
