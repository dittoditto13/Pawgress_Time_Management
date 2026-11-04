// Client-side stand-in for a backend. Every function is async so it can later be
// replaced with real API calls without touching any component.
//
// NOTE: localStorage is NOT secure storage. Passwords are salted and hashed so they
// are never stored in plain text, but real accounts need a server.

import { todayKey } from '../utils/dates.js';

const USERS_KEY = 'streakpet:users';
const SESSION_KEY = 'streakpet:session';
const dataKey = (id) => `streakpet:data:${id}`;

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

async function hash(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
const publicUser = ({ id, email }) => ({ id, email });

export const defaultData = () => ({ tasks: [], startedAt: todayKey() });

export async function signUp({ email, password }) {
  const users = read(USERS_KEY, []);
  const clean = email.trim().toLowerCase();
  if (users.some((u) => u.email === clean)) {
    throw new Error('An account with that email already exists. Log in instead.');
  }
  const salt = newId();
  const user = { id: newId(), email: clean, salt, passwordHash: await hash(password, salt) };
  write(USERS_KEY, [...users, user]);
  write(dataKey(user.id), defaultData());
  write(SESSION_KEY, user.id);
  return publicUser(user);
}

export async function logIn({ email, password }) {
  const user = read(USERS_KEY, []).find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.passwordHash !== (await hash(password, user.salt))) {
    throw new Error('Email or password is incorrect.');
  }
  write(SESSION_KEY, user.id);
  return publicUser(user);
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function restoreSession() {
  const id = read(SESSION_KEY, null);
  const user = id && read(USERS_KEY, []).find((u) => u.id === id);
  return user ? publicUser(user) : null;
}

export function loadData(userId) {
  const saved = read(dataKey(userId), {});
  return { ...defaultData(), tasks: saved.tasks || [], startedAt: saved.startedAt || todayKey() };
}

export function saveData(userId, data) {
  write(dataKey(userId), { tasks: data.tasks, startedAt: data.startedAt });
}
