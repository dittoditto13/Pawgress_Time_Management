import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.restoreSession());
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const signUp = useCallback(async (fields) => {
    const u = await api.signUp(fields);
    setUser(u);
    return u;
  }, []);

  const logIn = useCallback(async (fields) => {
    const u = await api.logIn(fields);
    setUser(u);
    return u;
  }, []);

  const logOut = useCallback(() => {
    api.logOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signUp, logIn, logOut }),
    [user, ready, signUp, logIn, logOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
