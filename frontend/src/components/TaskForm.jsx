import { useEffect, useState } from 'react';

const blank = (date) => ({ title: '', date, start: '', end: '', repeat: 'none' });

// Add or edit a task. Only a title and a date are required.
export default function TaskForm({ defaultDate, editing, onSave, onCancel }) {
  const [form, setForm] = useState(() => (editing ? { ...blank(defaultDate), ...editing } : blank(defaultDate)));
  const [error, setError] = useState('');

  // Follow the day being viewed while adding; load the task when editing starts.
  useEffect(() => {
    setForm(editing ? { ...blank(defaultDate), ...editing } : (f) => ({ ...f, date: defaultDate }));
    setError('');
  }, [editing, defaultDate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Enter a task title.');
    if (!form.date) return setError('Pick a date.');
    if (form.start && form.end && form.end <= form.start) return setError('End time must be after start time.');
    onSave({ title: form.title.trim(), date: form.date, start: form.start, end: form.end, repeat: form.repeat });
    setForm(blank(defaultDate));
    setError('');
  };

  return (
    <form onSubmit={submit} noValidate className="card grid gap-3" aria-label={editing ? 'Edit task' : 'Add task'}>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="task-title">Task title</label>
        <input
          id="task-title"
          className="input"
          placeholder="New task"
          value={form.title}
          onChange={set('title')}
          maxLength={80}
        />
        <button type="submit" className="btn btn-primary shrink-0">{editing ? 'Save' : 'Add'}</button>
        {editing && <button type="button" className="btn shrink-0" onClick={onCancel}>Cancel</button>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1.5fr_1.2fr_1.2fr_1fr]">
        <label className="label">
          Date
          <input type="date" className="input" value={form.date} onChange={set('date')} />
        </label>
        <label className="label">
          Start
          <input type="time" className="input" value={form.start} onChange={set('start')} />
        </label>
        <label className="label">
          End
          <input type="time" className="input" value={form.end} onChange={set('end')} />
        </label>
        <label className="label">
          Repeat
          <select className="input" value={form.repeat} onChange={set('repeat')}>
            <option value="none">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
