// All dates are handled in the user's LOCAL timezone, so a day ends at local midnight.

const pad = (n) => String(n).padStart(2, '0');

export function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(now = new Date()) {
  return toKey(now);
}

export function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function daysBetween(startKey, endKey) {
  const out = [];
  let cur = startKey;
  while (cur <= endKey) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

export function startOfWeek(key) {
  const d = fromKey(key);
  d.setDate(d.getDate() - d.getDay()); // Sunday start
  return toKey(d);
}

export function weekKeys(key) {
  const start = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function weekdayOf(key) {
  return fromKey(key).getDay();
}

export function formatLong(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShort(key) {
  return fromKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatWeekday(key) {
  return fromKey(key).toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

export function msUntilMidnight(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}
