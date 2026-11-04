import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { backend } from '../services/backend.js';

// The study buddy, only available when the backend supports it and the user has an account.
//   enabled   : false for guests and for backends without a buddy (the UI hides the panel)
//   buddy     : { name, streak, longest_streak, level, xp, xp_to_next, last_study_date } or null
//   loading   : true while the buddy is being fetched
//   error     : message if the last fetch failed, otherwise ''
//   reload()  : fetch the buddy again
//   logSession(minutes) : record a study session; resolves { xpGained, leveledUp }, rejects with a readable message
const BuddyContext = createContext(null);

export function BuddyProvider({ children }) {
  const { user } = useAuth();
  const enabled = Boolean(backend.buddy && backend.features?.buddy && user && !user.isGuest);
  const [buddy, setBuddy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setBuddy(await backend.buddy.get());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load when someone with an account signs in; clear when they leave.
  useEffect(() => {
    if (enabled) reload();
    else {
      setBuddy(null);
      setError('');
    }
  }, [enabled, user?.id, reload]);

  const logSession = useCallback(async (minutes) => {
    const res = await backend.buddy.logSession(minutes);
    setBuddy(res.buddy);
    return { xpGained: res.xpGained, leveledUp: res.leveledUp };
  }, []);

  const value = useMemo(
    () => ({ enabled, buddy, loading, error, reload, logSession }),
    [enabled, buddy, loading, error, reload, logSession]
  );
  return <BuddyContext.Provider value={value}>{children}</BuddyContext.Provider>;
}

export function useBuddy() {
  const ctx = useContext(BuddyContext);
  if (!ctx) throw new Error('useBuddy must be used inside <BuddyProvider>');
  return ctx;
}
