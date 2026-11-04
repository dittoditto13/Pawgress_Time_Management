import { addDays, formatShort, formatWeekday } from '../utils/dates.js';

const STYLE = {
  counted: 'bg-emerald-500 border-emerald-500 text-white',
  missed: 'bg-red-100 border-red-300 text-red-700',
  open: 'bg-white border-blue-400 border-dashed text-neutral-700',
  empty: 'bg-neutral-100 border-neutral-200 text-neutral-400',
};
const LABEL = { counted: 'counted', missed: 'missed', open: 'in progress', empty: 'no tasks' };
const MARK = { counted: '✓', missed: '✕', open: '', empty: '' };

// Last 14 days, newest on the right. Click a day to view and edit it.
export default function HistoryStrip({ days, today, selected, onSelect }) {
  const keys = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  return (
    <ol className="grid grid-cols-7 gap-1.5 sm:grid-cols-14" aria-label="Last 14 days">
      {keys.map((key) => {
        const status = days[key]?.status || 'empty';
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onSelect(key)}
              aria-label={`${formatShort(key)}, ${LABEL[status]}`}
              aria-current={key === selected ? 'date' : undefined}
              title={`${formatShort(key)}: ${LABEL[status]}`}
              className={`grid w-full cursor-pointer justify-items-center gap-0.5 rounded-md border py-1 text-xs ${STYLE[status]} ${
                key === selected ? 'ring-2 ring-blue-600 ring-offset-1' : ''
              }`}
            >
              <span className="text-[0.65rem] opacity-80">{formatWeekday(key).slice(0, 2)}</span>
              <span className="font-semibold">{MARK[status] || '·'}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
