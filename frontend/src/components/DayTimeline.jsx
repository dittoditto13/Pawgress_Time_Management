import clsx from 'clsx';
import { Check } from 'lucide-react';
import { formatTime } from '../utils/dates.js';
import { tasksForDate, isDone } from '../utils/streak.js';

const START_HOUR = 6;
const END_HOUR = 23;
const HOUR_PX = 56;

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Vertical timeline of one day. Tasks without times are listed above it.
export default function DayTimeline({ tasks, dateKey, onToggle, onEdit }) {
  const list = tasksForDate(tasks, dateKey);
  const timed = list.filter((t) => t.start);
  const untimed = list.filter((t) => !t.start);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div>
      {untimed.length > 0 && (
        <ul className="mb-4 grid grid-cols-[minmax(0,1fr)] gap-1.5">
          {untimed.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onToggle(t.id, dateKey)}
                className={clsx('w-full cursor-pointer truncate rounded-lg px-2 py-1 text-left text-sm font-semibold', isDone(t, dateKey) ? 'bg-mint text-white line-through' : 'bg-violet-tint')}
              >
                {t.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative ml-16 border-l-2 border-line" style={{ height: hours.length * HOUR_PX }}>
        {hours.map((h, i) => (
          <div key={h} className="absolute inset-x-0 border-t border-line" style={{ top: i * HOUR_PX }}>
            <span className="absolute -left-[4.4rem] -top-2.5 w-15 bg-white text-right text-xs text-ink-soft">
              {formatTime(`${h}:00`)}
            </span>
          </div>
        ))}
        {timed.map((t) => {
          const s = Math.max(toMinutes(t.start), START_HOUR * 60);
          const e = t.end ? toMinutes(t.end) : s + 45;
          const top = ((s - START_HOUR * 60) / 60) * HOUR_PX;
          const height = Math.max(((e - s) / 60) * HOUR_PX, 30);
          const done = isDone(t, dateKey);
          return (
            <div
              key={t.id}
              className={clsx(
                'absolute left-2.5 right-1.5 flex items-start gap-2 overflow-hidden rounded-xl border-l-[5px] px-2 py-1.5',
                done ? 'border-mint bg-mint-tint' : 'border-violet bg-violet-tint'
              )}
              style={{ top, height }}
            >
              <button
                type="button"
                onClick={() => onToggle(t.id, dateKey)}
                aria-pressed={done}
                aria-label={`${done ? 'Mark not done' : 'Mark done'}: ${t.title}`}
                className={clsx('grid size-5.5 shrink-0 cursor-pointer place-items-center rounded-md border-2 text-white', done ? 'border-mint bg-mint' : 'border-ink-soft bg-white')}
              >
                {done && <Check className="size-3.5" strokeWidth={3.5} aria-hidden="true" />}
              </button>
              <button type="button" className="grid min-w-0 cursor-pointer text-left text-sm" onClick={() => onEdit(t)}>
                <strong className={clsx('truncate', done && 'line-through')}>{t.title}</strong>
                <span className="text-xs text-ink-soft">{formatTime(t.start)}{t.end ? ` – ${formatTime(t.end)}` : ''}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
