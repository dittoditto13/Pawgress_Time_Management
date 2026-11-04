// REST adapter: accounts, tokens, the study buddy and study sessions live on the backend.
// It satisfies the same contract as the other adapters (see ../contract.js), plus:
//   * features.username / features.buddy   (the UI shows the extra fields and buddy panel)
//   * buddy.get() / buddy.logSession()
//   * auth.onSessionLost(handler)          (called when a token refresh is rejected)
//
// Differences from the contract's email-based auth:
//   * signUp takes { username, email, password }; logIn takes { username, password }.
//   * user.id is the username. (/api/token/ returns no user id, so it is the one value
//     available on both register and login.) user.email is only known right after sign-up.
//
// The backend has NO task endpoints, so tasks stay on this device (localStorage, via the
// local adapter) under the user's id. They survive log out and don't sync between devices.

import { GUEST_USER } from '../contract.js';
import { ApiError } from '../errors.js';
import { createApiClient } from '../api.js';
import { createLocalAdapter } from './local.js';

const SESSION_KEY = 'streakpet:rest-session'; // the signed-in profile, or { guest: true }

/** @param {{ baseUrl: string, fetchImpl?: typeof fetch, storage?: Storage }} options */
export function createRestAdapter({ baseUrl, fetchImpl, storage = globalThis.localStorage }) {
  const api = createApiClient({ baseUrl, fetchImpl, storage });
  const local = createLocalAdapter(storage); // task storage

  const readSession = () => {
    try {
      return JSON.parse(storage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  };
  const writeSession = (value) => storage.setItem(SESSION_KEY, JSON.stringify(value));
  const clearSession = () => storage.removeItem(SESSION_KEY);

  const requireAccount = () => {
    const s = readSession();
    if (!s || s.guest) throw new Error('Sign in to use your study buddy.');
  };

  return {
    name: 'rest',
    features: { username: true, buddy: true },

    auth: {
      async getSession() {
        const s = readSession();
        if (!s) return null;
        if (s.guest) return { ...GUEST_USER };
        // A profile without tokens can't call the server, so treat it as signed out.
        return api.tokens.get()?.refresh ? s : null;
      },

      async signUp({ username, email, password }) {
        const created = await api.register({ username: username.trim(), email: email.trim(), password });
        const user = { id: created.username, username: created.username, email: email.trim(), isGuest: false };
        writeSession(user);
        return user;
      },

      async logIn({ username, password }) {
        const name = username.trim();
        try {
          await api.login({ username: name, password });
        } catch (err) {
          // The server's wording ("No active account found...") is wordy; keep one clear message.
          if (err instanceof ApiError && err.status === 401) throw new Error('Username or password is incorrect.');
          throw err;
        }
        const user = { id: name, username: name, email: null, isGuest: false };
        writeSession(user);
        return user;
      },

      async logOut() {
        api.tokens.clear();
        clearSession(); // task data is kept
      },

      async continueAsGuest() {
        api.tokens.clear();
        writeSession({ guest: true });
        return { ...GUEST_USER };
      },

      onSessionLost(handler) {
        api.setAuthLostHandler(() => {
          clearSession();
          handler();
        });
      },
    },

    data: local.data,

    buddy: {
      async get() {
        requireAccount();
        return api.getBuddy();
      },
      /** @returns {Promise<{xpGained: number, leveledUp: boolean, buddy: object}>} */
      async logSession(minutes) {
        requireAccount();
        const res = await api.logStudySession(minutes);
        return { xpGained: res.xp_gained, leveledUp: res.leveled_up, buddy: res.buddy };
      },
    },
  };
}
