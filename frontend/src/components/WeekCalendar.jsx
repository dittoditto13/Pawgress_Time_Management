import clsx from 'clsx';
import { formatShort, formatWeekday, weekKeys } from '../utils/dates.js';
import { dayStats, tasksForDate, isDone } from '../utils/streak.js';

const STATUS_LABEL = { counted: 'Counted', missed: 'Missed', open: 'In progress', empty: '' };
const STATUS_BG = {
  counted: 'bg-mint-tint',
  missed: 'bg-coral-tint',
  default: 'bg-white',
};

export default function WeekCalendar({ tasks, anchor, selected, today, streak, onSelect, onToggle }) {
  const keys = weekKeys(anchor);
  return (
    <div className="grid gap-2 md:grid-cols-[repeat(7,minmax(0,1fr))]" role="grid" aria-label="Week view">
      {keys.map((key) => {
        const list = tasksForDate(tasks, key);
        const stats = dayStats(tasks, key);
        const status = streak.days[key]?.status ?? 'empty';
        return (
          <div
            key={key}
            role="gridcell"
            className={clsx(
              'flex min-h-0 min-w-0 flex-col gap-2 rounded-2xl border-2 p-2 md:min-h-44',
              STATUS_BG[status] || STATUS_BG.default,
              key === today ? 'border-violet' : 'border-line',
              key === selected && 'ring-4 ring-violet-tint'
            )}
          >
            <button
              type="button"
              className="grid cursor-pointer gap-px rounded-lg p-0.5 text-left"
              onClick={() => onSelect(key)}
              aria-label={`Open ${formatShort(key)}`}
            >
              <span className="font-display font-extrabold">{formatWeekday(key)}</span>
              <span className="text-xs text-ink-soft">{formatShort(key)}</span>
              {list.length > 0 && (
                <span className="text-xs font-bold">
                  {stats.done}/{stats.total}{STATUS_LABEL[status] ? ` · ${STATUS_LABEL[status]}` : ''}
                </span>
              )}
            </button>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
              {list.slice(0, 5).map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(t.id, key)}
                    title={isDone(t, key) ? 'Mark not done' : 'Mark done'}
                    className={clsx(
                      'block w-full cursor-pointer truncate rounded-lg px-2 py-1 text-left text-xs font-semibold',
                      isDone(t, key) ? 'bg-mint text-white line-through' : 'bg-violet-tint hover:bg-violet/15'
                    )}
                  >
                    {t.title}
                  </button>
                </li>
              ))}
              {list.length > 5 && <li className="text-xs text-ink-soft">+{list.length - 5} more</li>}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
