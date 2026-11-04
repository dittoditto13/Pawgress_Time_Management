// The one place that decides where accounts and tasks live.
//
//   VITE_API_BASE_URL set at build time   ->  rest adapter (the live backend)
//   Running in Electron (window.streakpet) ->  electron adapter
//   Anywhere else (npm run dev, no env)    ->  local adapter (localStorage)
//
// Components never import an adapter; they use this `backend` (through AuthContext,
// DataContext and BuddyContext). To plug in a different store, change the selection below.

import { createLocalAdapter } from './adapters/local.js';
import { createElectronAdapter } from './adapters/electron.js';
import { createRestAdapter } from './adapters/rest.js';
import { API_BASE } from './api.js';

const bridge = typeof window !== 'undefined' ? window.streakpet : undefined;

/** @type {import('./contract.js').Backend} */
export const backend = API_BASE
  ? createRestAdapter({ baseUrl: API_BASE })
  : bridge
    ? createElectronAdapter(bridge)
    : createLocalAdapter();
