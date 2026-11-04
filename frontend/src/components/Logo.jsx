import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link
      to={to}
      aria-label="StreakPet home"
      className={clsx('inline-flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight no-underline', light ? 'text-white' : 'text-ink')}
    >
      <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#5b3df5" />
        <circle cx="32" cy="35" r="17" fill="#ffc145" />
        <circle cx="26" cy="32" r="2.6" fill="#1b1740" />
        <circle cx="38" cy="32" r="2.6" fill="#1b1740" />
        <path d="M26 40q6 6 12 0" stroke="#1b1740" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M32 6c3 6 8 8 8 14a8 8 0 0 1-16 0c0-3 2-4 3-7 2 2 3 2 5-7z" fill="#ff9f1c" />
      </svg>
      <span>StreakPet</span>
    </Link>
  );
}
