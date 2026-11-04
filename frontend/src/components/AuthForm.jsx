import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from './Logo.jsx';
import PetAvatar from './PetAvatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthForm({ mode }) {
  const isSignup = mode === 'signup';
  const { signUp, logIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (isSignup && !form.name.trim()) return setError('Enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    setBusy(true);
    try {
      if (isSignup) await signUp(form);
      else await logIn(form);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden grid-rows-[auto_1fr_auto] justify-items-start bg-violet px-12 py-8 text-white md:grid">
        <Logo light />
        <div className="place-self-center rounded-full bg-white/15 p-9">
          <PetAvatar state="happy" size={190} />
        </div>
        <p className="max-w-[22ch] font-display text-3xl font-bold leading-tight">
          Finish your tasks, keep the streak, and your pet stays happy.
        </p>
      </div>

      <div className="grid place-items-center px-5 py-8">
        <form className="grid w-full max-w-sm gap-4" onSubmit={submit} noValidate>
          <div className="md:hidden"><Logo /></div>
          <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-ink-soft">
            {isSignup ? 'Your schedule, streak, and rewards are saved to your account.' : 'Log in to see today’s tasks.'}
          </p>
          {isSignup && (
            <label className="field">
              <span>Name</span>
              <input className="input" value={form.name} onChange={set('name')} autoComplete="name" />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <span className="relative block">
              <input
                type={show ? 'text' : 'password'}
                className="input pr-12"
                value={form.password}
                onChange={set('password')}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
              </button>
            </span>
            {isSignup && <small className="font-normal text-ink-soft">At least 8 characters.</small>}
          </label>
          {error && <p className="rounded-xl bg-coral-tint px-3.5 py-2.5 font-semibold text-coral" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? 'One moment…' : isSignup ? 'Create account' : 'Log in'}
          </button>
          <p className="text-center">
            {isSignup ? (
              <>Already have an account? <Link to="/login" className="font-semibold">Log in</Link></>
            ) : (
              <>New here? <Link to="/signup" className="font-semibold">Create an account</Link></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
