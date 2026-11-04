// Checks the streak rules from the design notebook. Run with: npm run test:logic
import assert from 'node:assert/strict';
import { computeStreak, dayStats, occursOn } from '../src/utils/streak.js';
import { addDays } from '../src/utils/dates.js';

const today = '2026-10-28';
const mkTask = (extra = {}) => ({ id: 't', title: 'x', date: addDays(today, -20), repeat: 'daily', completions: {}, ...extra });
const doneOn = (task, keys) => keys.forEach((k) => { task.completions[k] = true; });
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => addDays(today, from + i));

// 80% rule: 4 of 5 counts, 3 of 5 does not
{
  const tasks = Array.from({ length: 5 }, (_, i) => mkTask({ id: `a${i}`, date: today, repeat: 'none' }));
  tasks.slice(0, 3).forEach((t) => doneOn(t, [today]));
  assert.equal(computeStreak(tasks, today).current, 0, '3/5 must not count');
  doneOn(tasks[3], [today]);
  assert.equal(computeStreak(tasks, today).current, 1, '4/5 must count');
}

// 1 task needs 1, 2 tasks need 2 (80% rounds up)
{
  const a = mkTask({ id: 'a', date: today, repeat: 'none' });
  const b = mkTask({ id: 'b', date: today, repeat: 'none' });
  doneOn(a, [today]);
  assert.equal(dayStats([a, b], today).needed, 2);
  assert.equal(computeStreak([a, b], today).current, 0);
}

// Streak, longest, reset after a missed day
{
  const t = mkTask();
  doneOn(t, range(-9, -5)); // 5 days
  // -4 missed
  doneOn(t, range(-3, 0)); // 4 days including today
  const s = computeStreak([t], today);
  assert.equal(s.current, 4);
  assert.equal(s.longest, 5);
}

// A miss resets the streak to 0 and the longest is kept
{
  const t = mkTask();
  doneOn(t, range(-9, -5));
  const s = computeStreak([t], today);
  assert.equal(s.current, 0);
  assert.equal(s.longest, 5);
  assert.equal(s.days[addDays(today, -1)].status, 'missed');
}

// Today still in progress does not break the streak
{
  const t = mkTask();
  doneOn(t, range(-4, -1));
  const s = computeStreak([t], today);
  assert.equal(s.current, 4);
  assert.equal(s.today.status, 'open');
}

// Days with no tasks are neutral
{
  const a = mkTask({ id: 'a', date: addDays(today, -2), repeat: 'none' });
  const b = mkTask({ id: 'b', date: today, repeat: 'none' });
  doneOn(a, [a.date]);
  doneOn(b, [today]);
  const s = computeStreak([a, b], today);
  assert.equal(s.current, 2);
  assert.equal(s.days[addDays(today, -1)].status, 'empty');
}

// Repeats
{
  const weekly = mkTask({ repeat: 'weekly', date: '2026-10-21' });
  assert.equal(occursOn(weekly, '2026-10-28'), true);
  assert.equal(occursOn(weekly, '2026-10-27'), false);
  assert.equal(occursOn(weekly, '2026-10-14'), false, 'not before its start date');
  assert.equal(dayStats([weekly], '2026-10-28').total, 1);
}

console.log('All streak checks passed.');
