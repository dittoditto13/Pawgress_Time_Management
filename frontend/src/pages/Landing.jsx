import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CircleCheckBig, Gift, PawPrint } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import PetAvatar from '../components/PetAvatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { nextReaction } from '../utils/pet.js';

const STEPS = [
  { title: 'Plan your week', body: 'Add classes, study blocks, and deadlines. Repeat the ones that happen every week.', icon: CalendarDays },
  { title: 'Check off tasks', body: 'Finish at least 80% of a day’s tasks and the day counts toward your streak.', icon: CircleCheckBig },
  { title: 'Earn loot boxes', body: 'Every 7 streak days fills the reward bar and unlocks a loot box with a collectible.', icon: Gift },
  { title: 'Keep your pet happy', body: 'Your pet cheers when you stay on track and misses you when you slip.', icon: PawPrint },
];

const MOODS = [
  { state: 'happy', label: 'Day counted' },
  { state: 'idle', label: 'Ready to start' },
  { state: 'sad', label: 'Missed yesterday' },
  { state: 'sleeping', label: 'Late night' },
];

const RULES = [
  ['80% rule.', 'You don’t need a perfect day. Finish 4 of 5 tasks and it counts.'],
  ['Midnight reset.', 'Each day ends at midnight in your local time.'],
  ['Misses reset the streak.', 'Your longest streak is always saved.'],
  ['15 collectibles.', 'Common, rare, and legendary items to equip on your pet.'],
];

export default function Landing() {
  const { user } = useAuth();
  const [reaction, setReaction] = useState(null);
  const [mood, setMood] = useState('happy');

  const poke = () => {
    setReaction((r) => nextReaction(r));
    setTimeout(() => setReaction(null), 1400);
  };

  const cta = user ? '/dashboard' : '/signup';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <nav aria-label="Account" className="flex gap-2">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Open app</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up free</Link>
            </>
          )}
        </nav>
      </header>

      <section className="grid items-center gap-10 py-8 md:grid-cols-[1.15fr_1fr] md:py-16">
        <div>
          <h1 className="text-[clamp(2.3rem,1.2rem+4.2vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
            Finish your tasks. Keep the streak. Feed the pet.
          </h1>
          <p className="mb-7 mt-5 max-w-[52ch] text-lg text-ink-soft">
            StreakPet helps first-year students follow through on planned study time. Every finished day
            grows your streak, fills a reward bar, and keeps a pet companion happy.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={cta} className="btn btn-primary btn-lg">{user ? 'Go to today' : 'Start your streak'}</Link>
            <a href="#how" className="btn btn-outline btn-lg">See how it works</a>
          </div>
        </div>

        <div className="grid justify-items-center gap-3.5 rounded-[2.25rem] bg-[radial-gradient(circle_at_50%_38%,#fff_0_40%,var(--color-violet-tint)_41%_100%)] px-5 py-7">
          <button type="button" onClick={poke} aria-label="Tap the pet" className="cursor-pointer rounded-full">
            <PetAvatar state={mood} reaction={reaction} size={260} accessory={mood === 'happy' ? '🎧' : null} />
          </button>
          <p className="text-sm text-ink-soft">Tap the pet, then pick a mood.</p>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Pet mood">
            {MOODS.map((m) => (
              <button key={m.state} type="button" className="pill" onClick={() => setMood(m.state)} aria-pressed={mood === m.state}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-10">
        <h2 className="mb-6 text-[clamp(1.5rem,1rem+1.6vw,2.1rem)]">How a day works</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ title, body, icon: Icon }) => (
            <li key={title} className="grid content-start gap-2 rounded-card bg-white p-5 shadow-card">
              <span className="mb-1 grid size-12 place-items-center rounded-2xl bg-violet-tint text-violet">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p className="text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid items-start gap-8 pb-14 pt-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="mb-6 text-[clamp(1.5rem,1rem+1.6vw,2.1rem)]">Clear rules, no surprises</h2>
          <ul className="grid gap-3.5">
            {RULES.map(([lead, rest]) => (
              <li key={lead} className="border-l-4 border-sun pl-4">
                <strong>{lead}</strong> {rest}
              </li>
            ))}
          </ul>
        </div>
        <div className="card grid justify-items-start gap-3 bg-ink text-white">
          <h3>Ready for day one?</h3>
          <p className="text-[#cfc9f5]">Create a free account and add your first task in under 30 seconds.</p>
          <Link to={cta} className="btn btn-primary">{user ? 'Go to today' : 'Create account'}</Link>
        </div>
      </section>

      <footer className="border-t border-line pb-10 pt-7">
        <p className="text-ink-soft">StreakPet · ENED 1001C, Team 1 · Gwen Kramer, AJ Gronau, Amar-Erdene B., Jonathan Hoeting</p>
      </footer>
    </div>
  );
}
