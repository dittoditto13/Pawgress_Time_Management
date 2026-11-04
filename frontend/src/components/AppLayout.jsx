import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { CalendarDays, Flame, Gift, House, LogOut, PawPrint, Settings } from 'lucide-react';
import Logo from './Logo.jsx';
import PetWidget from './PetWidget.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';

const LINKS = [
  { to: '/dashboard', label: 'Today', icon: House },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/pet', label: 'Pet', icon: PawPrint },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const { user, logOut } = useAuth();
  const { streak, unopenedBoxes } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();
    navigate('/');
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] md:grid-cols-[14rem_1fr]">
      <a
        href="#main"
        className="absolute left-3 top-[-60px] z-50 rounded-lg bg-ink px-4 py-2 text-white focus:top-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-white px-4 py-3 md:col-span-2 md:px-6">
        <Logo to="/dashboard" />
        <div
          className="flex items-center gap-1.5 rounded-full bg-sun-tint px-3.5 py-1.5"
          aria-label={`Current streak ${streak.current} days`}
        >
          <Flame className={clsx('size-5', streak.current > 0 ? 'fill-flame text-flame' : 'text-ink-soft')} aria-hidden="true" />
          <strong className="font-display text-lg leading-none">{streak.current}</strong>
          <span className="hidden text-ink-soft sm:inline">day streak</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-ink-soft sm:inline">{user.name}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-white px-1 pb-[calc(0.375rem+env(safe-area-inset-bottom))] pt-1.5 md:sticky md:top-[61px] md:flex-col md:justify-start md:gap-1 md:self-start md:border-0 md:bg-transparent md:p-4"
      >
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-semibold no-underline transition md:flex-row md:gap-3 md:px-3.5 md:py-2.5 md:text-base',
                isActive ? 'bg-ink text-white' : 'text-ink hover:bg-violet-tint'
              )
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{label}</span>
            {to === '/rewards' && unopenedBoxes > 0 && (
              <span
                className="absolute right-1 top-0 grid min-w-5 place-items-center rounded-full bg-coral px-1.5 text-xs font-extrabold text-white md:static md:ml-auto"
                aria-label={`${unopenedBoxes} loot boxes ready`}
              >
                {unopenedBoxes}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <main id="main" tabIndex={-1} className="min-w-0 px-4 pb-32 pt-6 focus:outline-none md:px-8 md:pb-24 md:pt-8 md:col-start-2 md:row-start-2">
        <Outlet />
      </main>

      <PetWidget />
    </div>
  );
}
