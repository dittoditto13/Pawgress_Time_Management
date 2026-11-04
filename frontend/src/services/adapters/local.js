// Browser adapter: accounts and tasks live in localStorage. This is what runs under
// `npm run dev` and is the reference implementation of the contract in ../contract.js.
//
// NOT secure storage. Passwords are salted and hashed so they are never stored in plain
// text, but anyone with access to the browser profile can read everything. It exists so
// the prototype works with no server and no Electron.

import { GUEST_ID, GUEST_USER, emptyData, normalizeData } from '../contract.js';

const USERS_KEY = 'streakpet:users';
const SESSION_KEY = 'streakpet:session';
const dataKey = (id) => `streakpet:data:${id}`;

async function hash(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
const publicUser = ({ id, email }) => ({ id, email, isGuest: false });

/** @param {Storage} storage  Anything with getItem/setItem/removeItem. Injectable for tests. */
export function createLocalAdapter(storage = globalThis.localStorage) {
  const read = (key, fallback) => {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => storage.setItem(key, JSON.stringify(value));
  const users = () => read(USERS_KEY, []);

  return {
    name: 'local',

    auth: {
      async getSession() {
        const id = read(SESSION_KEY, null);
        if (id === GUEST_ID) return { ...GUEST_USER };
        const user = id && users().find((u) => u.id === id);
        return user ? publicUser(user) : null;
      },

      async signUp({ email, password }) {
        const clean = email.trim().toLowerCase();
        if (users().some((u) => u.email === clean)) {
          throw new Error('An account with that email already exists. Log in instead.');
        }
        const salt = newId();
        const user = { id: newId(), email: clean, salt, passwordHash: await hash(password, salt) };
        write(USERS_KEY, [...users(), user]);
        write(dataKey(user.id), emptyData());
        write(SESSION_KEY, user.id);
        return publicUser(user);
      },

      async logIn({ email, password }) {
        const user = users().find((u) => u.email === email.trim().toLowerCase());
        if (!user || user.passwordHash !== (await hash(password, user.salt))) {
          throw new Error('Email or password is incorrect.');
        }
        write(SESSION_KEY, user.id);
        return publicUser(user);
      },

      async logOut() {
        storage.removeItem(SESSION_KEY); // data is kept
      },

      async continueAsGuest() {
        write(SESSION_KEY, GUEST_ID);
        return { ...GUEST_USER };
      },
    },

    data: {
      async load(userId) {
        const saved = read(dataKey(userId), null);
        return saved ? normalizeData(saved) : emptyData();
      },
      async save(userId, data) {
        write(dataKey(userId), { tasks: data.tasks, startedAt: data.startedAt });
      },
    },
  };
}
