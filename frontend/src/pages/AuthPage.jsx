import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { backend } from '../services/backend.js';

// Login and sign-up share this page; `mode` is "login" or "signup" (set by the route).
// With the REST backend, accounts use a username: sign-up asks for username + email + password
// and log-in asks for username + password. Other backends use email + password.
// "Continue without signing in" starts a guest session so the prototype can be used with
// no account. Remove that button when real auth is required.
export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const usesUsername = Boolean(backend.features?.username);
  const showEmail = !usesUsername || isSignup;
  const { signUp, logIn, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const run = async (action) => {
    setError('');
    setBusy(true);
    try {
      await action();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (usesUsername && !form.username.trim()) return setError('Enter your username.');
    if (showEmail && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    // With a real backend the server decides what makes a valid password and says so in its error.
    if (usesUsername ? !form.password : form.password.length < 8) {
      return setError(usesUsername ? 'Enter your password.' : 'Password must be at least 8 characters.');
    }
    const credentials = usesUsername
      ? { username: form.username, ...(isSignup && { email: form.email }), password: form.password }
      : { email: form.email, password: form.password };
    run(() => (isSignup ? signUp(credentials) : logIn(credentials)));
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="card grid w-full max-w-sm gap-4 p-6">
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div>
            <h1 className="text-xl font-semibold">StreakPet</h1>
            <p className="text-sm text-neutral-600">{isSignup ? 'Create an account' : 'Log in to your account'}</p>
          </div>
          {usesUsername && (
            <label className="label">
              Username
              <input className="input" value={form.username} onChange={set('username')} autoComplete="username" autoFocus />
            </label>
          )}
          {showEmail && (
            <label className="label">
              Email
              <input type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" autoFocus={!usesUsername} />
            </label>
          )}
          <label className="label">
            Password
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={set('password')}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn btn-primary py-2" disabled={busy}>
            {isSignup ? 'Sign up' : 'Log in'}
          </button>
          <p className="text-center text-sm text-neutral-600">
            {isSignup ? 'Have an account? ' : 'No account? '}
            <Link to={isSignup ? '/login' : '/signup'} className="font-medium text-blue-600 hover:underline">
              {isSignup ? 'Log in' : 'Sign up'}
            </Link>
          </p>
        </form>

        <div className="flex items-center gap-3 text-xs text-neutral-400" aria-hidden="true">
          <span className="h-px flex-1 bg-neutral-200" />
          or
          <span className="h-px flex-1 bg-neutral-200" />
        </div>
        <button type="button" className="btn py-2" onClick={() => run(continueAsGuest)} disabled={busy}>
          Continue without signing in
        </button>
      </div>
    </main>
  );
}
