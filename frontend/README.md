# StreakPet (prototype)

A minimal prototype of the to-do list and streak mechanism from the Team 1 ENED 1001C design notebook.
React 18 + Vite 5 + Tailwind CSS v4 + React Router. JavaScript.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run test:logic   # checks the streak rules
```

## What it does

- **Register / log in** with email and password.
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
  components/   StreakSummary, HistoryStrip, TaskForm, TaskList
  context/      AuthContext, DataContext
  services/     storage.js  (the only file that touches storage)
  utils/        streak.js, dates.js
```

## Notes

Accounts and tasks are stored in the browser's localStorage (passwords are salted and hashed, but this is
not secure storage). To persist across devices, replace `src/services/storage.js` with calls to a server.
The pet, loot boxes, and rewards from the notebook are intentionally left out of this prototype.
