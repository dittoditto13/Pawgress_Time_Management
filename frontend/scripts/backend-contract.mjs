// Reusable checks for the backend contract (src/services/contract.js).
// `runContractTests(makeBackend)` takes a function returning a FRESH, EMPTY backend and
// throws on the first violation. Point it at your real Electron-backed adapter later to
// prove it behaves like the reference local adapter.
import assert from 'node:assert/strict';

const rejects = (promise, pattern, label) =>
  assert.rejects(promise, (err) => {
    assert.match(err.message, pattern, label);
    return true;
  });

export async function runContractTests(makeBackend) {
  const b = await makeBackend();
  const creds = { email: 'Gwen@Mail.UC.edu', password: 'password123' };
  const sample = (n) => ({ tasks: [{ id: `t${n}`, title: `Task ${n}`, date: '2026-11-03', start: '', end: '', repeat: 'none', completions: {} }], startedAt: '2026-11-01' });

  // Nothing signed in at first
  assert.equal(await b.auth.getSession(), null, 'no session at first run');

  // Sign up signs in, and the session is restorable
  const user = await b.auth.signUp(creds);
  assert.equal(user.email, 'gwen@mail.uc.edu', 'email is normalized to lower case');
  assert.equal(user.isGuest, false);
  assert.ok(user.id && user.id !== 'guest');
  assert.deepEqual(await b.auth.getSession(), user, 'session restores the same user');
  assert.equal('passwordHash' in user, false, 'never expose the hash');
  assert.equal('password' in user, false);

  // Duplicate email (any case) is rejected
  await rejects(b.auth.signUp({ ...creds, email: 'GWEN@mail.uc.edu' }), /already exists/, 'duplicate email');

  // A brand-new user has valid empty data
  const fresh = await b.data.load(user.id);
  assert.deepEqual(fresh.tasks, []);
  assert.equal(typeof fresh.startedAt, 'string');

  // Data round-trips
  await b.data.save(user.id, sample(1));
  assert.deepEqual((await b.data.load(user.id)).tasks, sample(1).tasks);

  // Log out ends the session but keeps the data
  await b.auth.logOut();
  assert.equal(await b.auth.getSession(), null, 'logged out');

  // Bad credentials all give the same message (no account enumeration)
  await rejects(b.auth.logIn({ ...creds, password: 'wrongpassword' }), /Email or password is incorrect/, 'wrong password');
  await rejects(b.auth.logIn({ email: 'nobody@mail.uc.edu', password: 'password123' }), /Email or password is incorrect/, 'unknown email');
  assert.equal(await b.auth.getSession(), null, 'failed login must not create a session');

  // Correct credentials (any email case) sign back in, data intact
  const again = await b.auth.logIn({ ...creds, email: 'gwen@mail.uc.edu' });
  assert.equal(again.id, user.id, 'same account id');
  assert.deepEqual((await b.data.load(again.id)).tasks, sample(1).tasks, 'data survived logout');
  await b.auth.logOut();

  // Guest: no credentials, id "guest", own data, survives logout
  const guest = await b.auth.continueAsGuest();
  assert.equal(guest.id, 'guest');
  assert.equal(guest.isGuest, true);
  assert.equal(guest.email, null);
  assert.deepEqual(await b.auth.getSession(), guest, 'guest session restores');
  assert.deepEqual((await b.data.load('guest')).tasks, [], 'guest starts empty, not with the account data');
  await b.data.save('guest', sample(2));
  await b.auth.logOut();
  assert.equal(await b.auth.getSession(), null);
  assert.deepEqual((await b.data.load('guest')).tasks, sample(2).tasks, 'guest data kept after leaving guest mode');

  // Users are isolated from each other
  const other = await b.auth.signUp({ email: 'aj@mail.uc.edu', password: 'password123' });
  assert.deepEqual((await b.data.load(other.id)).tasks, [], 'new user does not see anyone else’s tasks');
  assert.deepEqual((await b.data.load(user.id)).tasks, sample(1).tasks, 'original user unchanged');
}
