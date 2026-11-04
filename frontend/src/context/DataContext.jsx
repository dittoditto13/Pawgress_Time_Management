import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { backend } from '../services/backend.js';
import { emptyData } from '../services/contract.js';
import { addDays, msUntilMidnight, todayKey } from '../utils/dates.js';
import { computeStreak } from '../utils/streak.js';

// The signed-in user's tasks and the streak derived from them.
//   loaded       : false until this user's data has been read from the backend
//   tasks, today : the task list and today's date key ("YYYY-MM-DD", local time)
//   streak       : { current, longest, today, days } from utils/streak.js
//   saveError    : message if the last save failed, otherwise null
//   addTask / updateTask / deleteTask / toggleComplete : edit tasks (saved automatically)
//   loadSampleData / clearAll : testing aids
const DataContext = createContext(null);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(emptyData);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [today, setToday] = useState(() => todayKey());
  const loadedFor = useRef(null); // id of the user whose data is currently in state

  // Load this user's data whenever the signed-in user changes (including sign-out).
  useEffect(() => {
    loadedFor.current = null; // stops the save effect writing old data under a new user
    setLoaded(false);
    setSaveError(null);
    if (!user) {
      setData(emptyData());
      return undefined;
    }
    let cancelled = false;
    backend.data
      .load(user.id)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        loadedFor.current = user.id;
        setLoaded(true);
      })
      .catch((err) => {
        if (!cancelled) setSaveError(`Could not load your tasks: ${err.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Save after every change, but only once the right user's data has loaded.
  useEffect(() => {
    if (!user || !loaded || loadedFor.current !== user.id) return;
    backend.data
      .save(user.id, data)
      .then(() => setSaveError(null))
      .catch((err) => setSaveError(`Could not save your changes: ${err.message}`));
  }, [data, user, loaded]);

  // A day ends at local midnight: roll "today" over then (and re-check each minute for sleeping tabs).
  useEffect(() => {
    const tick = () => setToday(todayKey());
    const minute = setInterval(tick, 60_000);
    const midnight = setTimeout(tick, msUntilMidnight());
    return () => {
      clearInterval(minute);
      clearTimeout(midnight);
    };
  }, [today]);

  const streak = useMemo(() => computeStreak(data.tasks, today, data.startedAt), [data.tasks, data.startedAt, today]);

  const addTask = useCallback((task) => {
    setData((d) => ({ ...d, tasks: [...d.tasks, { id: uid(), repeat: 'none', completions: {}, ...task }] }));
  }, []);

  const updateTask = useCallback((id, patch) => {
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, []);

  const deleteTask = useCallback((id) => {
    setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
  }, []);

  const toggleComplete = useCallback((id, key) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => {
        if (t.id !== id) return t;
        const completions = { ...(t.completions || {}) };
        if (completions[key]) delete completions[key];
        else completions[key] = true;
        return { ...t, completions };
      }),
    }));
  }, []);

  // Testing aid: 6 fully completed past days plus today's tasks, so a streak is visible right away.
  const loadSampleData = useCallback(() => {
    const start = addDays(todayKey(), -6);
    const mk = (title, from, to) => ({ id: uid(), title, date: start, start: from, end: to, repeat: 'daily', completions: {} });
    const tasks = [mk('Read chapter', '09:00', '10:00'), mk('Problem set', '13:00', '14:30'), mk('Review notes', '19:00', '19:45')];
    for (let i = 0; i < 6; i += 1) tasks.forEach((t) => { t.completions[addDays(start, i)] = true; });
    setData((d) => ({ ...d, tasks: [...d.tasks, ...tasks], startedAt: start < d.startedAt ? start : d.startedAt }));
  }, []);

  const clearAll = useCallback(() => setData(emptyData()), []);

  const value = useMemo(
    () => ({ loaded, saveError, tasks: data.tasks, today, streak, addTask, updateTask, deleteTask, toggleComplete, loadSampleData, clearAll }),
    [loaded, saveError, data.tasks, today, streak, addTask, updateTask, deleteTask, toggleComplete, loadSampleData, clearAll]
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
