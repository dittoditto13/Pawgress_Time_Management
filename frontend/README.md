# StreakPet (prototype)

A minimal prototype of the to-do list and streak mechanism from the Team 1 ENED 1001C design notebook.
React 18 + Vite 5 + Tailwind CSS v4 + React Router. JavaScript.

```bash
npm install
cp .env.example .env.local   # points the app at the backend (see "Backend" below)
npm run dev                  # http://localhost:5173
npm run build
npm test                     # streak rules + backend contract + REST adapter
```

## Backend

The app talks to the backend through `src/services/backend.js`, which picks an adapter:

| Condition | Adapter | Accounts | Tasks |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` set at build time | `rest` (live backend) | backend, username + email + password, JWT | this device only |
| Electron preload exposes `window.streakpet` | `electron` | your main process | your main process |
| neither | `local` (localStorage) | this browser | this browser |

**Env var.** Set `VITE_API_BASE_URL` (no trailing slash; `https://` is added if you leave it off). Vite reads it at
**build time**, so in Vercel set it under Project Settings -> Environment Variables and **redeploy**.

**REST adapter** (`src/services/adapters/rest.js`, HTTP client in `src/services/api.js`):
- Register, log in (by **username**), refresh, `GET /api/buddy/`, `POST /api/study-sessions/`.
- Every request sends `ngrok-skip-browser-warning: true`; POSTs send `Content-Type: application/json`; protected
  requests send `Authorization: Bearer <access>`. Paths keep their trailing slash. No cookies, no `credentials`.
- On `401` with `code: "token_not_valid"` it refreshes once (concurrent calls share one refresh) and retries.
  If the refresh is rejected, the user is signed out. A network failure never signs anyone out.
- `src/services/errors.js` turns all three error shapes (`{error}`, `{detail}`, `{field: [..]}`) into one message.
- Tokens are kept in localStorage for the demo, never logged, never committed.
- The backend has **no task endpoints**, so tasks are saved on this device under the username (and survive log out).
  Guests have no backend session and no buddy.
- `user.id` is the username (the token endpoint returns no user id).

The study buddy's **study streak** (days with a logged session, from the server) and the **task streak** (days with 80% of
tasks done, computed locally) are separate numbers. The page labels them accordingly.

## What it does

- **Register / log in** (username + email + password on the REST backend; email + password on the others), or continue as a guest.
- **Study buddy** (REST backend only): level, XP, study streak, and a "Log a study session" form (1-600 minutes).
- **Tasks:** add (title + date, optional start/end time, repeat never/daily/weekly), check off, edit, delete.
- **Streak:** current and longest streak, today's progress against the 80% line, and the last 14 days.
  Click any day to view it, and check tasks on past days to try out streak behavior.
- "Load sample data" and "Clear all tasks" at the bottom are testing aids.

## Streak rules

- A day counts when at least 80% of its tasks are done (rounded up: 4 of 5, 2 of 2, 6 of 7).
- Days end at local midnight.
- A missed day resets the streak to 0; the longest streak is kept.
- A day with no tasks is neutral: it does not extend or break the streak.
- The streak is derived from task completions (`src/utils/streak.js`), so it can't drift out of sync.

## Layout

```
src/
  pages/        AuthPage (login + sign up), Home (the only app screen)
  components/   BuddyCard, StudyForm, StreakSummary, HistoryStrip, TaskForm, TaskList
  context/      AuthContext, BuddyContext, DataContext
  services/     backend.js (adapter selection), contract.js, api.js, errors.js
    adapters/   rest.js, local.js, electron.js
  utils/        streak.js, dates.js
scripts/        test-streak.mjs, test-backend.mjs (contract), test-rest.mjs
```

## Notes

The `local` adapter stores accounts in localStorage (passwords salted and hashed, but not secure storage); it only
exists so the prototype runs with no server. The pet, loot boxes, and rewards from the notebook are intentionally
left out of this prototype.
