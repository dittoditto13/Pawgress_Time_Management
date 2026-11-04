import { useState } from 'react';
import StreakSummary from '../components/StreakSummary.jsx';
import HistoryStrip from '../components/HistoryStrip.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskList from '../components/TaskList.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { addDays, formatLong } from '../utils/dates.js';

export default function Home() {
  const { user, logOut } = useAuth();
  const { tasks, today, streak, addTask, updateTask, deleteTask, toggleComplete, loadSampleData, clearAll } = useData();
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState(null);

  const save = (values) => {
    if (editing) updateTask(editing.id, values);
    else addTask(values);
    setEditing(null);
  };

  const remove = (task) => {
    const msg = task.repeat !== 'none' ? `Delete "${task.title}" and all its repeats?` : `Delete "${task.title}"?`;
    if (window.confirm(msg)) {
      deleteTask(task.id);
      if (editing?.id === task.id) setEditing(null);
    }
  };

  const isToday = selected === today;
  const dayLabel = isToday ? `Today, ${formatLong(selected)}` : formatLong(selected);

  return (
    <div className="mx-auto grid max-w-xl gap-5 px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">StreakPet</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden truncate text-neutral-600 sm:inline">{user.email}</span>
          <button type="button" className="btn" onClick={logOut}>Log out</button>
        </div>
      </header>

      <StreakSummary />

      <HistoryStrip days={streak.days} today={today} selected={selected} onSelect={setSelected} />

      <section className="grid gap-3" aria-labelledby="day-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="day-heading" className="font-semibold">{dayLabel}</h2>
          <div className="flex gap-1">
            <button type="button" className="btn" onClick={() => setSelected(addDays(selected, -1))} aria-label="Previous day">‹</button>
            <button type="button" className="btn" onClick={() => setSelected(today)} disabled={isToday}>Today</button>
            <button type="button" className="btn" onClick={() => setSelected(addDays(selected, 1))} aria-label="Next day">›</button>
          </div>
        </div>
        <TaskList tasks={tasks} dateKey={selected} onToggle={toggleComplete} onEdit={setEditing} onDelete={remove} />
        <TaskForm defaultDate={selected} editing={editing} onSave={save} onCancel={() => setEditing(null)} />
      </section>

      <footer className="flex justify-center gap-4 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
        <button type="button" className="hover:text-neutral-900 hover:underline" onClick={loadSampleData}>Load sample data</button>
        <button
          type="button"
          className="hover:text-neutral-900 hover:underline"
          onClick={() => window.confirm('Delete all tasks and reset your streak?') && clearAll()}
        >
          Clear all tasks
        </button>
      </footer>
    </div>
  );
}
