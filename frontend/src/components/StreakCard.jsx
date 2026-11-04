import clsx from 'clsx';
import { Flame } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { STREAK_THRESHOLD } from '../utils/streak.js';

export default function StreakCard() {
  const { streak } = useData();
  const t = streak.today;
  const need = Math.ceil(t.total * STREAK_THRESHOLD);
  const counted = t.status === 'counted';

  let message;
  if (t.total === 0) message = 'Add a task for today to start building your streak.';
  else if (counted) message = 'Today counts. Your streak is safe until midnight.';
  else message = `Finish ${need - t.done} more task${need - t.done === 1 ? '' : 's'} today to keep your streak (${need} of ${t.total} needed).`;

  return (
    <section className="card grid content-start gap-4 bg-linear-to-br from-white from-55% to-sun-tint" aria-labelledby="streak-heading">
      <h2 id="streak-heading" className="sr-only">Streak</h2>
      <div className="flex items-center gap-4">
        <Flame
          aria-hidden="true"
          className={clsx(
            'size-16 origin-bottom transition',
            streak.current > 0 ? 'animate-flicker fill-flame text-flame' : 'text-ink-soft/40'
          )}
        />
        <div>
          <p className="font-display text-6xl font-extrabold leading-none tracking-tighter" aria-live="polite">{streak.current}</p>
          <p className="text-ink-soft">day streak</p>
        </div>
      </div>
      <dl className="m-0 flex gap-7">
        <div>
          <dt className="text-sm text-ink-soft">Longest</dt>
          <dd className="m-0 font-display text-lg font-extrabold">{streak.longest} day{streak.longest === 1 ? '' : 's'}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Today</dt>
          <dd className="m-0 font-display text-lg font-extrabold">{t.done}/{t.total} done</dd>
        </div>
      </dl>
      <p className={clsx('text-[0.95rem]', counted ? 'font-semibold text-mint-dark' : 'text-ink-soft')}>{message}</p>
    </section>
  );
}
