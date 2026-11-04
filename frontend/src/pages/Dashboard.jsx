import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Check, Plus, X } from 'lucide-react';
import StreakCard from '../components/StreakCard.jsx';
import RewardBar from '../components/RewardBar.jsx';
import TaskList from '../components/TaskList.jsx';
import TaskForm from '../components/TaskForm.jsx';
import PetAvatar from '../components/PetAvatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { addDays, formatLong, formatWeekday } from '../utils/dates.js';
import { STATE_LINES } from '../utils/pet.js';

const greeting = (h) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');

const DOT = {
  counted: 'bg-mint text-white',
  missed: 'bg-coral text-white',
  open: 'border-[3px] border-dashed border-violet bg-white',
  empty: 'bg-violet-tint',
};
const DOT_LABEL = { counted: 'counted', missed: 'missed', open: 'in progress', empty: 'no tasks' };

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, today, now, streak, petState, settings, equippedItem, unopenedBoxes, toggleComplete, addTask } = useData();
  const [adding, setAdding] = useState(false);

  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const first = user.name.split(' ')[0];

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>{greeting(now.getHours())}, {first}</h1>
          <p className="text-ink-soft">{formatLong(today)}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <Plus className="size-5" aria-hidden="true" />
          Add task
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StreakCard />

        <section className="card" aria-labelledby="reward-heading">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h2 id="reward-heading">Next loot box</h2>
            {unopenedBoxes > 0 && <Link to="/rewards" className="btn btn-sm btn-primary">Open {unopenedBoxes}</Link>}
          </div>
          <RewardBar />
        </section>

        {settings.petEnabled && (
          <section className="card grid content-center justify-items-center gap-2.5 bg-linear-to-b from-white from-40% to-violet-tint text-center sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:col-start-3 lg:row-start-1" aria-labelledby="pet-heading">
            <h2 id="pet-heading" className="sr-only">Your pet</h2>
            <PetAvatar state={petState} accessory={equippedItem?.emoji} size={150} />
            <p className="max-w-[28ch]"><strong>{settings.petName}:</strong> {STATE_LINES[petState]}</p>
            <Link to="/pet" className="btn btn-outline btn-sm">Visit {settings.petName}</Link>
          </section>
        )}

        <section className="card sm:col-span-2" aria-labelledby="today-heading">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h2 id="today-heading">Today’s tasks</h2>
            <Link to="/schedule" className="font-semibold no-underline hover:underline">Full schedule</Link>
          </div>
          <TaskList tasks={tasks} dateKey={today} onToggle={toggleComplete} onAdd={() => setAdding(true)} showActions={false} />
        </section>

        <section className="card sm:col-span-2" aria-labelledby="week-heading">
          <h2 id="week-heading">Last 7 days</h2>
          <ol className="mt-4 grid grid-cols-7 gap-1.5 text-center">
            {last7.map((key) => {
              const status = streak.days[key]?.status || 'empty';
              return (
                <li key={key} className="grid justify-items-center gap-1.5 text-[0.82rem] font-semibold">
                  <span className={clsx('grid size-9 place-items-center rounded-full sm:size-10', DOT[status])} aria-hidden="true">
                    {status === 'counted' && <Check className="size-5" strokeWidth={3.5} />}
                    {status === 'missed' && <X className="size-5" strokeWidth={3.5} />}
                  </span>
                  <span>{key === today ? 'Today' : formatWeekday(key)}</span>
                  <span className="sr-only">{DOT_LABEL[status]}</span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {adding && (
        <TaskForm defaultDate={today} onClose={() => setAdding(false)} onSave={(t) => { addTask(t); setAdding(false); }} />
      )}
    </div>
  );
}
