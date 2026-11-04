import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { defaultData, loadData, saveData } from '../services/storage.js';
import { addDays, msUntilMidnight, todayKey } from '../utils/dates.js';
import { computeStreak } from '../utils/streak.js';

const DataContext = createContext(null);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(defaultData);
  const [today, setToday] = useState(() => todayKey());
  const loadedFor = useRef(null);

  // Load this user's data whenever the signed-in user changes.
  useEffect(() => {
    setData(user ? loadData(user.id) : defaultData());
    loadedFor.current = user ? user.id : null;
  }, [user]);

  // Save on every change, but only once the right user's data has loaded.
  useEffect(() => {
    if (user && loadedFor.current === user.id) saveData(user.id, data);
  }, [data, user]);

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

  const clearAll = useCallback(() => setData({ ...defaultData() }), []);

  const value = useMemo(
    () => ({ tasks: data.tasks, today, streak, addTask, updateTask, deleteTask, toggleComplete, loadSampleData, clearAll }),
    [data.tasks, today, streak, addTask, updateTask, deleteTask, toggleComplete, loadSampleData, clearAll]
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
