import { useState } from 'react';
import clsx from 'clsx';
import { CalendarDays, ChevronLeft, ChevronRight, List, Plus, Rows3 } from 'lucide-react';
import TaskList from '../components/TaskList.jsx';
import TaskForm from '../components/TaskForm.jsx';
import WeekCalendar from '../components/WeekCalendar.jsx';
import DayTimeline from '../components/DayTimeline.jsx';
import Modal from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { addDays, formatLong, formatShort, weekKeys } from '../utils/dates.js';
import { dayStats } from '../utils/streak.js';

const VIEWS = [
  { id: 'list', label: 'List', icon: List },
  { id: 'week', label: 'Week', icon: CalendarDays },
  { id: 'day', label: 'Day', icon: Rows3 },
];

export default function Schedule() {
  const { tasks, today, streak, addTask, updateTask, deleteTask, toggleComplete } = useData();
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState(null); // task | 'new' | null
  const [confirm, setConfirm] = useState(null);

  const stats = dayStats(tasks, selected);
  const step = view === 'week' ? 7 : 1;
  const week = weekKeys(selected);
  const title = view === 'week' ? `${formatShort(week[0])} – ${formatShort(week[6])}` : formatLong(selected);

  const save = (values) => {
    if (editing && editing !== 'new') updateTask(editing.id, values);
    else addTask(values);
    setEditing(null);
  };

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Schedule</h1>
          <p className="text-ink-soft">Plan your days, then check tasks off as you finish them.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
          <Plus className="size-5" aria-hidden="true" />
          Add task
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-white p-1 shadow-card" role="tablist" aria-label="Schedule view">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={clsx(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 font-bold transition',
                view === id ? 'bg-ink text-white' : 'text-ink hover:bg-violet-tint'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" className="icon-btn" onClick={() => setSelected(addDays(selected, -step))} aria-label={`Previous ${view === 'week' ? 'week' : 'day'}`}>
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <strong className="min-w-[11ch] text-center font-display">{title}</strong>
          <button type="button" className="icon-btn" onClick={() => setSelected(addDays(selected, step))} aria-label={`Next ${view === 'week' ? 'week' : 'day'}`}>
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(today)} disabled={selected === today}>
            Today
          </button>
        </div>
      </div>

      <section className="card">
        {view !== 'week' && (
          <p className="mb-3.5 text-ink-soft">
            {stats.total === 0 ? 'No tasks on this day.' : `${stats.done} of ${stats.total} done (${Math.round(stats.ratio * 100)}%). 80% counts toward your streak.`}
          </p>
        )}
        {view === 'list' && (
          <TaskList tasks={tasks} dateKey={selected} onToggle={toggleComplete} onEdit={setEditing} onDelete={setConfirm} onAdd={() => setEditing('new')} />
        )}
        {view === 'day' && <DayTimeline tasks={tasks} dateKey={selected} onToggle={toggleComplete} onEdit={setEditing} />}
        {view === 'week' && (
          <WeekCalendar
            tasks={tasks}
            anchor={selected}
            selected={selected}
            today={today}
            streak={streak}
            onSelect={(k) => { setSelected(k); setView('day'); }}
            onToggle={toggleComplete}
          />
        )}
      </section>

      {editing && (
        <TaskForm initial={editing === 'new' ? null : editing} defaultDate={selected} onClose={() => setEditing(null)} onSave={save} />
      )}

      {confirm && (
        <Modal title="Delete task?" onClose={() => setConfirm(null)}>
          <p>
            “{confirm.title}” will be removed
            {confirm.repeat !== 'none' ? ' from every day it repeats' : ''}. Past completions for it will no longer count toward your streak.
          </p>
          <div className="flex justify-end gap-2.5">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)}>Keep task</button>
            <button type="button" className="btn btn-danger" onClick={() => { deleteTask(confirm.id); setConfirm(null); }}>Delete task</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
