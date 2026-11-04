// Electron adapter (wiring only; the main-process half is yours to build).
//
// Expected: your preload script exposes a bridge on `window.streakpet` using
// contextBridge + ipcRenderer.invoke, with this shape:
//
//   window.streakpet = {
//     auth: { getSession(), signUp(creds), logIn(creds), logOut(), continueAsGuest() },
//     data: { load(userId), save(userId, data) },
//   }
//
// Each function should resolve with exactly what ../contract.js documents. The renderer
// never sees password hashes, file paths or database handles. The main process owns
// those: do hashing (e.g. scrypt/argon2), the session, and the local database there.
// See docs/ARCHITECTURE.md ("Electron integration") for a step-by-step guide.

/** ipcRenderer.invoke wraps errors as "Error invoking remote method 'x': Error: msg". Keep only msg. */
export function cleanIpcError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  return new Error(msg.replace(/^Error invoking remote method '[^']*': (Error: )?/, ''));
}

/** @param {{auth: object, data: object}} bridge  The object preload put on window.streakpet. */
export function createElectronAdapter(bridge) {
  const wrap = (fn) => async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      throw cleanIpcError(err);
    }
  };

  return {
    name: 'electron',
    auth: {
      getSession: wrap(() => bridge.auth.getSession()),
      signUp: wrap((creds) => bridge.auth.signUp(creds)),
      logIn: wrap((creds) => bridge.auth.logIn(creds)),
      logOut: wrap(() => bridge.auth.logOut()),
      continueAsGuest: wrap(() => bridge.auth.continueAsGuest()),
    },
    data: {
      load: wrap((userId) => bridge.data.load(userId)),
      save: wrap((userId, data) => bridge.data.save(userId, data)),
    },
  };
}
