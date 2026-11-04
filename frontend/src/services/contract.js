// The backend contract. The UI talks ONLY to this shape (via `backend.js`), never to
// localStorage or Electron directly. To change where accounts and tasks live, write a
// new adapter that satisfies this contract and select it in `backend.js`.
//
// Every method is async, so an adapter can be a browser store, an Electron IPC call to
// a local database, or a network request, without any component changing.

import { todayKey } from '../utils/dates.js';

/**
 * @typedef {Object} User
 * @property {string} id            Stable id. The guest user always has id "guest".
 * @property {string|null} email    null for the guest.
 * @property {boolean} isGuest
 */

/**
 * Optional extensions, used by the REST adapter (adapters/rest.js). The base contract below
 * works without them; the UI only uses them when an adapter provides them.
 *
 *   backend.features    { username?: boolean, buddy?: boolean }
 *       username: accounts use a username. signUp gets {username, email, password}, logIn gets
 *       {username, password}, and User gains `username`.
 *   backend.buddy       { get(): Promise<Buddy>, logSession(minutes): Promise<{xpGained, leveledUp, buddy}> }
 *   backend.auth.onSessionLost(handler)   Call handler when the session can no longer be refreshed.
 *
 * @typedef {Object} Buddy
 * @property {string} name
 * @property {number} streak
 * @property {number} longest_streak
 * @property {number} level
 * @property {number} xp
 * @property {number} xp_to_next
 * @property {string|null} last_study_date   "YYYY-MM-DD"
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} date          First date it occurs, "YYYY-MM-DD" (local time).
 * @property {string} start         "HH:MM" or "" (optional).
 * @property {string} end           "HH:MM" or "" (optional).
 * @property {'none'|'daily'|'weekly'} repeat
 * @property {Record<string, true>} completions  Dates this task was completed, e.g. { "2026-11-03": true }.
 */

/**
 * @typedef {Object} UserData
 * @property {Task[]} tasks
 * @property {string} startedAt     "YYYY-MM-DD": the earliest day the streak is counted from.
 */

/**
 * @typedef {Object} Backend
 * @property {string} name          For debugging: "local" | "electron".
 * @property {Object} auth
 * @property {() => Promise<User|null>} auth.getSession
 *     The signed-in user (or guest) from the last run, or null. Called once at startup.
 * @property {(c: {email: string, password: string}) => Promise<User>} auth.signUp
 *     Create an account AND sign in. Reject with Error("An account with that email already exists...") if taken.
 * @property {(c: {email: string, password: string}) => Promise<User>} auth.logIn
 *     Reject with Error("Email or password is incorrect.") on any failure.
 * @property {() => Promise<void>} auth.logOut
 *     Ends the session. Must NOT delete the user's data.
 * @property {() => Promise<User>} auth.continueAsGuest
 *     Start a session as the guest user (id "guest") without credentials.
 * @property {Object} data
 * @property {(userId: string) => Promise<UserData>} data.load
 *     Always resolve to a valid UserData (use emptyData() when nothing is stored yet).
 * @property {(userId: string, data: UserData) => Promise<void>} data.save
 *     Called after every change, so it should be cheap. Reject if the write fails.
 */

export const GUEST_ID = 'guest';

/** @type {User} */
export const GUEST_USER = Object.freeze({ id: GUEST_ID, email: null, isGuest: true });

/** @returns {UserData} */
export const emptyData = () => ({ tasks: [], startedAt: todayKey() });

/** Coerce whatever an adapter read from disk into a valid UserData. */
export function normalizeData(raw) {
  const d = raw && typeof raw === 'object' ? raw : {};
  return {
    tasks: Array.isArray(d.tasks) ? d.tasks : [],
    startedAt: typeof d.startedAt === 'string' && d.startedAt ? d.startedAt : todayKey(),
  };
}
