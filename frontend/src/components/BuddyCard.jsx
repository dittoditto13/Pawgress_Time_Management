import { useBuddy } from '../context/BuddyContext.jsx';
import { formatShort } from '../utils/dates.js';

// The study buddy from the backend: its level and XP, and the streak of days with a logged session.
export default function BuddyCard() {
  const { buddy, loading, error, reload } = useBuddy();

  if (error) {
    return (
      <section className="card grid gap-2" aria-label="Study buddy">
        <p className="text-sm text-red-600" role="alert">Couldn’t load your study buddy. {error}</p>
        <button type="button" className="btn justify-self-start" onClick={reload} disabled={loading}>Try again</button>
      </section>
    );
  }
  if (!buddy) {
    return <p className="card text-sm text-neutral-500" aria-busy="true">Loading your study buddy…</p>;
  }

  return (
    <section className="card" aria-label="Study buddy">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{buddy.name}</h2>
          <p className="text-sm text-neutral-600">
            Level {buddy.level} · {buddy.xp} XP · {buddy.xp_to_next} XP to next level
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold leading-none tabular-nums" aria-live="polite">{buddy.streak}</p>
          <p className="mt-1 text-sm text-neutral-600">study streak</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-neutral-600">
        Longest: <span className="font-medium tabular-nums">{buddy.longest_streak}</span> day{buddy.longest_streak === 1 ? '' : 's'}
        {' · '}
        {buddy.last_study_date ? `Last studied ${formatShort(buddy.last_study_date)}` : 'No study sessions yet'}
      </p>
    </section>
  );
}
