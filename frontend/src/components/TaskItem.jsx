import clsx from 'clsx';
import { Check, Pencil, Repeat, Trash2 } from 'lucide-react';
import { formatTime } from '../utils/dates.js';
import { isDone } from '../utils/streak.js';

const REPEAT_LABEL = { daily: 'Every day', weekly: 'Every week' };

export default function TaskItem({ task, dateKey, onToggle, onEdit, onDelete, showActions = true }) {
  const done = isDone(task, dateKey);
  return (
    <li
      className={clsx(
        'flex flex-wrap items-center gap-3.5 rounded-2xl border-2 px-3.5 py-3 transition-colors sm:flex-nowrap',
        done ? 'border-transparent bg-mint-tint' : 'border-line bg-white'
      )}
    >
      <label className="relative block size-7 shrink-0 cursor-pointer">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(task.id, dateKey)}
          className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
        />
        <span className="absolute inset-0 grid place-items-center rounded-[9px] border-[2.5px] border-ink-soft bg-white text-white transition peer-checked:border-mint peer-checked:bg-mint peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet [&>svg]:scale-0 peer-checked:[&>svg]:scale-100 [&>svg]:transition-transform">
          <Check className="size-4" strokeWidth={3.5} aria-hidden="true" />
        </span>
        <span className="sr-only">Mark “{task.title}” {done ? 'not done' : 'done'}</span>
      </label>

      <div className="min-w-0 flex-1">
        <p className={clsx('break-words font-bold', done && 'text-ink-soft line-through')}>{task.title}</p>
        <p className="flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
          {task.start && (
            <span>{formatTime(task.start)}{task.end ? ` – ${formatTime(task.end)}` : ''}</span>
          )}
          {task.repeat !== 'none' && (
            <span className="inline-flex items-center gap-1">
              <Repeat className="size-3.5" aria-hidden="true" />
              {REPEAT_LABEL[task.repeat]}
            </span>
          )}
        </p>
      </div>

      {showActions && (
        <div className="flex w-full justify-end gap-0.5 sm:w-auto">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </button>
          <button type="button" className="btn btn-ghost btn-sm text-coral" onClick={() => onDelete(task)}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      )}
    </li>
  );
}
