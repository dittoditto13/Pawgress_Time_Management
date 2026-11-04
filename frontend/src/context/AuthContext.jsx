import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { backend } from '../services/backend.js';

// Who is signed in.
//   user            : { id, email, isGuest, username? } or null when signed out
//   loading         : true until the saved session has been checked at startup
//   signUp / logIn  : take whatever fields the backend needs (email+password, or
//                     username+email+password for the REST backend); they sign the user in
//   continueAsGuest : start a guest session with no credentials
//   logOut          : end the session (the user's tasks are kept)
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the last run.
  useEffect(() => {
    let cancelled = false;
    backend.auth
      .getSession()
      .then((u) => !cancelled && setUser(u))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Backends that use tokens tell us when the session can no longer be refreshed.
  useEffect(() => {
    backend.auth.onSessionLost?.(() => setUser(null));
  }, []);

  const signUp = useCallback(async (credentials) => setUser(await backend.auth.signUp(credentials)), []);
  const logIn = useCallback(async (credentials) => setUser(await backend.auth.logIn(credentials)), []);
  const continueAsGuest = useCallback(async () => setUser(await backend.auth.continueAsGuest()), []);
  const logOut = useCallback(async () => {
    await backend.auth.logOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signUp, logIn, continueAsGuest, logOut }),
    [user, loading, signUp, logIn, continueAsGuest, logOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
