// Runs the contract tests against both adapters. Run with: npm run test:backend
import assert from 'node:assert/strict';
import { createLocalAdapter } from '../src/services/adapters/local.js';
import { cleanIpcError, createElectronAdapter } from '../src/services/adapters/electron.js';
import { runContractTests } from './backend-contract.mjs';

const memoryStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};

// 1) Reference adapter, with an in-memory stand-in for localStorage
await runContractTests(() => createLocalAdapter(memoryStorage()));
console.log('local adapter: contract OK');

// 2) Electron adapter, with a fake preload bridge that mimics ipcRenderer.invoke error wrapping
await runContractTests(() => {
  const inner = createLocalAdapter(memoryStorage());
  const ipc = (fn) => async (...a) => {
    try {
      return await fn(...a);
    } catch (e) {
      throw new Error(`Error invoking remote method 'streakpet:call': Error: ${e.message}`);
    }
  };
  const bridge = {
    auth: Object.fromEntries(Object.entries(inner.auth).map(([k, f]) => [k, ipc(f)])),
    data: Object.fromEntries(Object.entries(inner.data).map(([k, f]) => [k, ipc(f)])),
  };
  return createElectronAdapter(bridge);
});
console.log('electron adapter (fake bridge): contract OK');

// 3) Error cleaning
assert.equal(cleanIpcError(new Error("Error invoking remote method 'x': Error: Nope.")).message, 'Nope.');
assert.equal(cleanIpcError(new Error('Plain')).message, 'Plain');
console.log('ipc error cleaning OK');
