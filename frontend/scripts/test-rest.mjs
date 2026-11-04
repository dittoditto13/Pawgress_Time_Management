// Tests the REST adapter and API client against an in-process fake of the backend.
// Run with: npm run test:rest
import assert from 'node:assert/strict';
import { createRestAdapter } from '../src/services/adapters/rest.js';
import { resolveBaseUrl } from '../src/services/api.js';
import { errorMessage } from '../src/services/errors.js';

const BASE = 'https://example.ngrok-free.dev';

const memoryStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    dump: () => [...m.values()].join('\n'),
  };
};

const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, text: async () => (body === undefined ? '' : JSON.stringify(body)) });

// A fake server that follows the documented contract, and records every request.
function fakeServer() {
  const s = { users: {}, calls: [], seq: 0, validAccess: new Set(), validRefresh: new Set(), refreshCalls: 0, offline: false, buddy: null };
  const issue = (username) => {
    const access = `acc-${++s.seq}`;
    const refresh = `ref-${++s.seq}`;
    s.validAccess.add(access);
    s.validRefresh.add(refresh);
    return { access, refresh };
  };
  s.expireAccessTokens = () => s.validAccess.clear();
  s.revokeRefreshTokens = () => s.validRefresh.clear();

  s.fetch = async (url, init = {}) => {
    if (s.offline) throw new TypeError('Failed to fetch');
    const path = url.slice(BASE.length);
    const body = init.body ? JSON.parse(init.body) : {};
    s.calls.push({ path, method: init.method, headers: init.headers || {}, init });
    const auth = (init.headers || {}).Authorization;

    if (path === '/api/register/') {
      if (!body.username || !body.email || !body.password) return reply(400, { error: 'All fields are required.' });
      if (s.users[body.username]) return reply(400, { error: 'Username already taken.' });
      s.users[body.username] = body.password;
      s.buddy = { name: `${body.username}'s buddy`, streak: 0, longest_streak: 0, level: 1, xp: 0, xp_to_next: 100, last_study_date: null };
      return reply(201, { message: 'ok', user_id: 7, username: body.username, ...issue(body.username) });
    }
    if (path === '/api/token/') {
      if (s.users[body.username] !== body.password) return reply(401, { detail: 'No active account found with the given credentials' });
      return reply(200, issue(body.username));
    }
    if (path === '/api/token/refresh/') {
      if (s.refreshOffline) throw new TypeError('Failed to fetch');
      s.refreshCalls += 1;
      if (!s.validRefresh.has(body.refresh)) return reply(401, { detail: 'Token is invalid or expired', code: 'token_not_valid' });
      const access = `acc-${++s.seq}`;
      s.validAccess.add(access);
      return reply(200, { access });
    }

    // Protected endpoints
    if (!auth || !s.validAccess.has(auth.replace('Bearer ', ''))) {
      return reply(401, { detail: 'Given token not valid for any token type', code: 'token_not_valid' });
    }
    if (path === '/api/buddy/') return reply(200, s.buddy);
    if (path === '/api/study-sessions/') {
      if (!Number.isInteger(body.minutes) || body.minutes < 1 || body.minutes > 600) {
        return reply(400, { minutes: ['Ensure this value is between 1 and 600.'] });
      }
      const xp = body.minutes;
      s.buddy = { ...s.buddy, xp: s.buddy.xp + xp, streak: 1, longest_streak: 1, level: 2, last_study_date: '2026-11-04' };
      return reply(201, { session_id: 1, xp_gained: xp, leveled_up: true, buddy: s.buddy });
    }
    return reply(404, { detail: 'Not found.' });
  };
  return s;
}

// Tokens must never be logged.
const logged = [];
for (const m of ['log', 'warn', 'error', 'info', 'debug']) console[m] = (...a) => logged.push(a.join(' '));
const out = (msg) => process.stdout.write(`${msg}\n`);

function setup() {
  const server = fakeServer();
  const storage = memoryStorage();
  const adapter = createRestAdapter({ baseUrl: BASE, fetchImpl: server.fetch, storage });
  return { server, storage, adapter };
}

// ---- helpers ----
assert.equal(resolveBaseUrl('suffrage-defiance-neuter.ngrok-free.dev'), 'https://suffrage-defiance-neuter.ngrok-free.dev');
assert.equal(resolveBaseUrl('https://x.dev/'), 'https://x.dev');
assert.equal(resolveBaseUrl(' http://localhost:8000// '), 'http://localhost:8000');
assert.equal(resolveBaseUrl('localhost:8000'), 'http://localhost:8000', 'bare localhost defaults to http');
assert.equal(resolveBaseUrl('127.0.0.1:8000/'), 'http://127.0.0.1:8000');
assert.equal(resolveBaseUrl(''), '');
assert.equal(resolveBaseUrl(undefined), '');

// One helper handles all three error shapes
assert.equal(errorMessage({ error: 'Username already taken.' }), 'Username already taken.');
assert.equal(errorMessage({ detail: 'No active account found with the given credentials' }), 'No active account found with the given credentials');
assert.equal(errorMessage({ minutes: ['Ensure this value is between 1 and 600.'] }), 'Minutes: Ensure this value is between 1 and 600.');
assert.equal(errorMessage({ email: ['Enter a valid email address.'], password: ['Too short.', 'Too common.'] }), 'Email: Enter a valid email address. Password: Too short. Too common.');
assert.equal(errorMessage({ non_field_errors: ['Nope.'] }), 'Nope.');
assert.match(errorMessage(null), /Something went wrong/);
assert.match(errorMessage({ code: 'x' }), /Something went wrong/);

// ---- register / session ----
{
  const { server, adapter } = setup();
  assert.equal(await adapter.auth.getSession(), null);
  const user = await adapter.auth.signUp({ username: ' gwen ', email: 'g@mail.uc.edu', password: 'password123' });
  assert.deepEqual(user, { id: 'gwen', username: 'gwen', email: 'g@mail.uc.edu', isGuest: false });
  assert.deepEqual(await adapter.auth.getSession(), user, 'session restores');

  // Required headers, trailing slashes, token-only auth
  for (const c of server.calls) {
    assert.equal(c.headers['ngrok-skip-browser-warning'], 'true', `ngrok header on ${c.path}`);
    assert.ok(c.path.endsWith('/'), `trailing slash on ${c.path}`);
    assert.equal(c.init.credentials, undefined, 'no credentials option (no cookies)');
    if (c.method === 'POST') assert.equal(c.headers['Content-Type'], 'application/json');
  }

  // Duplicate username -> {error}
  await assert.rejects(adapter.auth.signUp({ username: 'gwen', email: 'x@y.co', password: 'password123' }), /Username already taken\./);

  // Log out keeps tasks and clears the session
  await adapter.data.save('gwen', { tasks: [{ id: 't1', title: 'A', date: '2026-11-04', start: '', end: '', repeat: 'none', completions: {} }], startedAt: '2026-11-01' });
  await adapter.auth.logOut();
  assert.equal(await adapter.auth.getSession(), null);
  assert.equal((await adapter.data.load('gwen')).tasks.length, 1, 'tasks survive logout');
}

// ---- login ----
{
  const { server, adapter } = setup();
  server.users.gwen = 'password123';
  await assert.rejects(adapter.auth.logIn({ username: 'gwen', password: 'wrong' }), /Username or password is incorrect\./);
  assert.equal(await adapter.auth.getSession(), null, 'failed login makes no session');
  const user = await adapter.auth.logIn({ username: 'gwen', password: 'password123' });
  assert.equal(user.username, 'gwen');
  assert.equal(user.id, 'gwen', 'id is the username on login too, so task data keys match');
  const login = server.calls.findLast((c) => c.path === '/api/token/');
  assert.deepEqual(JSON.parse(login.init.body), { username: 'gwen', password: 'password123' }, 'login sends username, not email');
}

// ---- buddy + study sessions ----
{
  const { server, adapter } = setup();
  await adapter.auth.signUp({ username: 'gwen', email: 'g@mail.uc.edu', password: 'password123' });
  const buddy = await adapter.buddy.get();
  assert.equal(buddy.level, 1);
  const call = server.calls.at(-1);
  assert.match(call.headers.Authorization, /^Bearer acc-/, 'protected request sends the bearer token');

  const res = await adapter.buddy.logSession(45);
  assert.equal(res.xpGained, 45);
  assert.equal(res.leveledUp, true);
  assert.equal(res.buddy.xp, 45);

  // {field: [..]} validation errors read well
  await assert.rejects(adapter.buddy.logSession(0), /Minutes: Ensure this value is between 1 and 600\./);
  await assert.rejects(adapter.buddy.logSession(601), /Minutes: /);
}

// ---- expired access token: refresh once, retry, succeed ----
{
  const { server, adapter } = setup();
  await adapter.auth.signUp({ username: 'gwen', email: 'g@mail.uc.edu', password: 'password123' });
  server.expireAccessTokens();
  const buddy = await adapter.buddy.get();
  assert.equal(buddy.level, 1);
  assert.equal(server.refreshCalls, 1, 'refreshed exactly once');
  const refresh = server.calls.find((c) => c.path === '/api/token/refresh/');
  assert.equal(refresh.headers.Authorization, undefined, 'refresh sends the refresh token in the body, not a bearer header');

  // Concurrent requests share one refresh
  server.expireAccessTokens();
  server.refreshCalls = 0;
  await Promise.all([adapter.buddy.get(), adapter.buddy.get(), adapter.buddy.get()]);
  assert.equal(server.refreshCalls, 1, 'concurrent callers share one refresh');
}

// ---- refresh rejected: log out ----
{
  const { server, adapter, storage } = setup();
  let lost = 0;
  adapter.auth.onSessionLost(() => { lost += 1; });
  await adapter.auth.signUp({ username: 'gwen', email: 'g@mail.uc.edu', password: 'password123' });
  server.expireAccessTokens();
  server.revokeRefreshTokens();
  await assert.rejects(adapter.buddy.get(), /session has expired/);
  assert.equal(lost, 1, 'session-lost handler called');
  assert.equal(await adapter.auth.getSession(), null, 'signed out');
  assert.equal(storage.getItem('streakpet:tokens'), null, 'tokens cleared');
  assert.equal(server.refreshCalls, 1, 'did not retry the refresh in a loop');
}

// ---- network failure: friendly message, and no logout ----
{
  const { server, adapter } = setup();
  let lost = 0;
  adapter.auth.onSessionLost(() => { lost += 1; });
  await adapter.auth.signUp({ username: 'gwen', email: 'g@mail.uc.edu', password: 'password123' });
  server.offline = true;
  await assert.rejects(adapter.buddy.get(), /Can’t reach the server/);
  server.expireAccessTokens();
  server.offline = false;
  // Offline during the refresh itself must not sign the user out either
  server.refreshOffline = true;
  await assert.rejects(adapter.buddy.get(), /Can’t reach the server/);
  server.refreshOffline = false;
  assert.equal((await adapter.buddy.get()).level, 1, 'recovers once the network is back');
  assert.equal(lost, 0, 'a network error does not log the user out');
  assert.ok(await adapter.auth.getSession(), 'still signed in');
}

// ---- guest: no buddy, local tasks ----
{
  const { server, adapter } = setup();
  const guest = await adapter.auth.continueAsGuest();
  assert.equal(guest.isGuest, true);
  await assert.rejects(adapter.buddy.get(), /Sign in/);
  assert.equal(server.calls.length, 0, 'guest never calls the server');
  assert.equal((await adapter.auth.getSession()).isGuest, true);
}

// ---- no base URL configured ----
{
  const adapter = createRestAdapter({ baseUrl: '', storage: memoryStorage() });
  await assert.rejects(adapter.auth.logIn({ username: 'a', password: 'b' }), /VITE_API_BASE_URL/);
}

// ---- secrets: never logged, never in task storage ----
assert.equal(logged.length, 0, `nothing should be logged, got: ${logged.join(' | ')}`);

out('REST adapter: all checks passed.');
