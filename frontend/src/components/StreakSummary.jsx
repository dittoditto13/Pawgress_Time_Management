import { useData } from '../context/DataContext.jsx';

export default function StreakSummary() {
  const { streak } = useData();
  const t = streak.today;
  const pct = t.total ? Math.min(100, (t.done / t.total) * 100) : 0;

  let message;
  if (t.total === 0) message = 'No tasks today. Add one to keep the streak going.';
  else if (t.status === 'counted') message = 'Today counts toward your streak.';
  else message = `Finish ${t.needed - t.done} more to count today (80% of ${t.total}, rounded up).`;

  return (
    <section className="card" aria-label="Streak">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-5xl font-bold leading-none tabular-nums" aria-live="polite">{streak.current}</p>
          <p className="mt-1 text-sm text-neutral-600">day streak</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold leading-none tabular-nums">{streak.longest}</p>
          <p className="mt-1 text-sm text-neutral-600">longest</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="font-medium">Today</span>
          <span className="tabular-nums text-neutral-600">{t.done} / {t.total} done</span>
        </div>
        <div
          className="relative h-2.5 rounded-full bg-neutral-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={t.total}
          aria-valuenow={t.done}
          aria-label="Today's completion"
        >
          <div
            className={`h-full rounded-full transition-all ${t.status === 'counted' ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
          {t.total > 0 && <span className="absolute -top-0.5 h-3.5 w-0.5 bg-neutral-800" style={{ left: '80%' }} title="80% threshold" />}
        </div>
        <p className={`mt-2 text-sm ${t.status === 'counted' ? 'font-medium text-emerald-700' : 'text-neutral-600'}`}>{message}</p>
      </div>
    </section>
  );
}
