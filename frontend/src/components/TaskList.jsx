import { formatTime } from '../utils/dates.js';
import { isDone, tasksForDate } from '../utils/streak.js';

const REPEAT = { daily: 'Daily', weekly: 'Weekly' };

export default function TaskList({ tasks, dateKey, onToggle, onEdit, onDelete }) {
  const list = tasksForDate(tasks, dateKey);

  if (list.length === 0) {
    return <p className="card text-center text-sm text-neutral-500">No tasks for this day.</p>;
  }

  return (
    <ul className="grid gap-2">
      {list.map((t) => {
        const done = isDone(t, dateKey);
        const time = t.start ? `${formatTime(t.start)}${t.end ? ` – ${formatTime(t.end)}` : ''}` : '';
        return (
          <li key={t.id} className={`card flex items-center gap-3 py-3 ${done ? 'bg-neutral-50' : ''}`}>
            <input
              type="checkbox"
              id={`t-${t.id}`}
              checked={done}
              onChange={() => onToggle(t.id, dateKey)}
              className="size-5 shrink-0 cursor-pointer accent-emerald-600"
            />
            <label htmlFor={`t-${t.id}`} className="min-w-0 flex-1 cursor-pointer">
              <span className={`block break-words ${done ? 'text-neutral-400 line-through' : 'font-medium'}`}>{t.title}</span>
              {(time || t.repeat !== 'none') && (
                <span className="block text-xs text-neutral-500">
                  {[time, REPEAT[t.repeat]].filter(Boolean).join(' · ')}
                </span>
              )}
            </label>
            <button type="button" className="btn btn-quiet" onClick={() => onEdit(t)}>Edit</button>
            <button type="button" className="btn btn-quiet text-red-600 hover:bg-red-50" onClick={() => onDelete(t)}>Delete</button>
          </li>
        );
      })}
    </ul>
  );
}
