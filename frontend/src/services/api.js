// HTTP client for the StreakPet backend (used by adapters/rest.js; components never import it).
//
// * Base URL comes from VITE_API_BASE_URL. Vite reads it at BUILD time, so after changing it
//   in Vercel you must redeploy.
// * Every path keeps its trailing slash.
// * Auth is token-only: no cookies, no `credentials: 'include'`.
// * On a 401 with code "token_not_valid" we refresh once and retry; if the refresh is rejected
//   we sign the user out.
// * Tokens are never logged.

import { ApiError, errorMessage } from './errors.js';

const TOKEN_KEY = 'streakpet:tokens';

/**
 * "host" or "https://host/" -> "https://host" (no trailing slash). Empty string if unset.
 * A bare localhost / 127.0.0.1 address gets http:// since local dev servers don't have TLS.
 */
export function resolveBaseUrl(value) {
  const raw = (value || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return /^(localhost|127\.0\.0\.1)(:|$)/i.test(raw) ? `http://${raw}` : `https://${raw}`;
}

/** Base URL for this build (empty when VITE_API_BASE_URL isn't set). */
export const API_BASE = resolveBaseUrl(import.meta.env?.VITE_API_BASE_URL);

/**
 * @param {{ baseUrl: string, fetchImpl?: typeof fetch, storage?: Storage }} options
 *   fetchImpl and storage are injectable so the client can be tested without a network.
 */
export function createApiClient({ baseUrl, fetchImpl, storage = globalThis.localStorage } = {}) {
  const doFetch = fetchImpl || ((...args) => globalThis.fetch(...args));

  // ---- Token storage (localStorage is fine for the demo) ----
  const tokens = {
    get() {
      try {
        return JSON.parse(storage.getItem(TOKEN_KEY)) || null;
      } catch {
        return null;
      }
    },
    set(value) {
      try {
        storage.setItem(TOKEN_KEY, JSON.stringify(value));
      } catch {
        /* storage unavailable: the session just won't survive a reload */
      }
    },
    clear() {
      try {
        storage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore */
      }
    },
  };

  // The adapter registers a callback so a rejected refresh can sign the user out.
  let onAuthLost = () => {};

  // ---- Low-level request ----
  async function send(path, { method = 'GET', body, access } = {}) {
    if (!baseUrl) {
      throw new ApiError('The server address is not configured. Set VITE_API_BASE_URL and rebuild.');
    }
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (access) headers.Authorization = `Bearer ${access}`;

    let res;
    try {
      res = await doFetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new ApiError('Can’t reach the server. Check your connection and try again.');
    }

    // Normally JSON, but tolerate an HTML or empty body (proxy errors, 204s).
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const fallback = res.status >= 500 ? 'The server had a problem. Please try again.' : undefined;
      throw new ApiError(errorMessage(data, fallback), { status: res.status, data });
    }
    return data;
  }

  // ---- Token refresh (one request at a time, shared by concurrent callers) ----
  let refreshing = null;

  function refreshAccess() {
    if (!refreshing) {
      refreshing = (async () => {
        const current = tokens.get();
        if (!current?.refresh) throw new ApiError('Your session has expired. Please log in again.', { status: 401 });
        const data = await send('/api/token/refresh/', { method: 'POST', body: { refresh: current.refresh } });
        tokens.set({ ...current, access: data.access });
        return data.access;
      })().finally(() => {
        refreshing = null;
      });
    }
    return refreshing;
  }

  const isTokenInvalid = (err) => err instanceof ApiError && err.status === 401 && err.data?.code === 'token_not_valid';

  const expire = () => {
    tokens.clear();
    onAuthLost();
    return new ApiError('Your session has expired. Please log in again.', { status: 401 });
  };

  /** Authenticated request: refresh once and retry on token_not_valid, otherwise sign out. */
  async function authed(path, options = {}) {
    const current = tokens.get();
    if (!current?.access) throw expire();
    try {
      return await send(path, { ...options, access: current.access });
    } catch (err) {
      if (!isTokenInvalid(err)) throw err;
    }

    let access;
    try {
      access = await refreshAccess();
    } catch (err) {
      // A network blip shouldn't log anyone out; only a rejected refresh does.
      if (err instanceof ApiError && err.status > 0) throw expire();
      throw err;
    }
    try {
      return await send(path, { ...options, access });
    } catch (err) {
      if (isTokenInvalid(err)) throw expire();
      throw err;
    }
  }

  return {
    tokens,
    setAuthLostHandler: (fn) => {
      onAuthLost = fn;
    },

    async register({ username, email, password }) {
      const data = await send('/api/register/', { method: 'POST', body: { username, email, password } });
      tokens.set({ access: data.access, refresh: data.refresh });
      return { userId: data.user_id, username: data.username };
    },

    async login({ username, password }) {
      const data = await send('/api/token/', { method: 'POST', body: { username, password } });
      tokens.set({ access: data.access, refresh: data.refresh });
    },

    getBuddy: () => authed('/api/buddy/'),
    logStudySession: (minutes) => authed('/api/study-sessions/', { method: 'POST', body: { minutes } }),
  };
}
