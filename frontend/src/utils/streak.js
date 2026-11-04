import { daysBetween, weekdayOf } from './dates.js';

// Rules from the design notebook:
// * A day counts toward the streak when >= 80% of its scheduled tasks are done.
// * A day ends at local midnight.
// * A missed day resets the streak to 0; the longest streak is kept.
// * A day with no tasks is neutral: it neither extends nor breaks the streak.

export const STREAK_THRESHOLD = 0.8;

/** Does this task appear on the given date? Supports one-off, daily and weekly repeats. */
export function occursOn(task, key) {
  if (key < task.date) return false;
  if (task.repeat === 'daily') return true;
  if (task.repeat === 'weekly') return weekdayOf(key) === weekdayOf(task.date);
  return key === task.date;
}

export function tasksForDate(tasks, key) {
  return tasks
    .filter((t) => occursOn(t, key))
    .sort((a, b) => (a.start || '99:99').localeCompare(b.start || '99:99') || a.title.localeCompare(b.title));
}

export const isDone = (task, key) => Boolean(task.completions && task.completions[key]);

/** Tasks needed to count a day: at least 80% of the total, rounded up. */
export const neededFor = (total) => Math.ceil(total * STREAK_THRESHOLD);

export function dayStats(tasks, key) {
  const list = tasksForDate(tasks, key);
  const done = list.filter((t) => isDone(t, key)).length;
  return { total: list.length, done, needed: neededFor(list.length) };
}

const counts = (s) => s.total > 0 && s.done >= s.needed;

/**
 * Walk every day from the first task (or `startKey`) to `today` and derive the streak.
 * Everything comes from task completions, so it can never get out of sync.
 * Day status: 'counted' | 'missed' | 'open' (today, still in progress) | 'empty'.
 */
export function computeStreak(tasks, today, startKey) {
  const first = tasks.reduce((min, t) => (t.date < min ? t.date : min), startKey || today);
  const from = startKey && startKey < first ? startKey : first;

  let current = 0;
  let longest = 0;
  const days = {};

  for (const key of daysBetween(from > today ? today : from, today)) {
    const stats = dayStats(tasks, key);
    let status;
    if (stats.total === 0) status = 'empty';
    else if (counts(stats)) {
      status = 'counted';
      current += 1;
      longest = Math.max(longest, current);
    } else if (key < today) {
      status = 'missed';
      current = 0;
    } else status = 'open';
    days[key] = { ...stats, status };
  }

  return {
    current,
    longest,
    days,
    today: days[today] || { total: 0, done: 0, needed: 0, status: 'empty' },
  };
}
