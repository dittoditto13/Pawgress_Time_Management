import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { signUp, logIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true);
    try {
      await (isSignup ? signUp(form) : logIn(form));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} noValidate className="card grid w-full max-w-sm gap-4 p-6">
        <div>
          <h1 className="text-xl font-semibold">StreakPet</h1>
          <p className="text-sm text-neutral-600">{isSignup ? 'Create an account' : 'Log in to your account'}</p>
        </div>
        <label className="label">
          Email
          <input type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" autoFocus />
        </label>
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
    </main>
  );
}
