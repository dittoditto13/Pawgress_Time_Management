import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Power } from 'lucide-react';
import PetAvatar from '../components/PetAvatar.jsx';
import PetChat from '../components/PetChat.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useData } from '../context/DataContext.jsx';
import { PET_STATES, STATE_LINES, nextReaction } from '../utils/pet.js';

const STATE_WHY = {
  happy: 'Today already counts toward your streak.',
  idle: 'Nothing wrong. Finish 80% of today’s tasks to make your pet happy.',
  sad: 'Yesterday was missed. Complete today’s tasks to cheer your pet up.',
  sleeping: 'It’s between 10 PM and 7 AM, so your pet is asleep.',
};

export default function PetPage() {
  const { settings, updateSettings, petState, equippedItem } = useData();
  const [reaction, setReaction] = useState(null);
  const [preview, setPreview] = useState(null); // lets people peek at other states
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!settings.petEnabled) {
    return (
      <div className="page">
        <EmptyState
          icon={Moon}
          title={`${settings.petName} is turned off`}
          action={
            <button type="button" className="btn btn-primary mt-1" onClick={() => updateSettings({ petEnabled: true })}>
              <Power className="size-5" aria-hidden="true" />
              Turn pet on
            </button>
          }
        >
          Your streak and rewards still work. Turn your pet back on any time.
        </EmptyState>
      </div>
    );
  }

  const shown = preview || petState;
  const react = (kind) => {
    setReaction((r) => kind || nextReaction(r));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setReaction(null), 1500);
  };

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>{settings.petName}</h1>
          <p className="text-ink-soft">Tap your pet, chat with it, or dress it up with items from loot boxes.</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => updateSettings({ petEnabled: false })}>
          <Power className="size-4" aria-hidden="true" />
          Turn pet off
        </button>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <section className="card grid justify-items-center gap-3 bg-[radial-gradient(circle_at_50%_30%,#fff_0_30%,var(--color-violet-tint)_100%)] text-center" aria-labelledby="stage-heading">
          <h2 id="stage-heading" className="sr-only">Pet</h2>
          <button type="button" className="cursor-pointer rounded-full p-2" onClick={() => react()} aria-label={`Tap ${settings.petName}`}>
            <PetAvatar state={shown} reaction={reaction} accessory={equippedItem?.emoji} size={260} />
          </button>
          <p className="font-display text-xl font-bold">{STATE_LINES[shown]}</p>
          <p className="text-ink-soft">{preview ? `Previewing the “${preview}” state.` : STATE_WHY[petState]}</p>

          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Preview pet states">
            {PET_STATES.map((s) => (
              <button key={s} type="button" className="pill" onClick={() => setPreview(s === petState ? null : s)} aria-pressed={shown === s}>
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            <span className="text-ink-soft">Reactions:</span>
            {['bounce', 'spin', 'hearts'].map((r) => (
              <button key={r} type="button" className="btn btn-ghost btn-sm capitalize" onClick={() => react(r)}>{r}</button>
            ))}
          </div>

          <p className="text-sm text-ink-soft">
            {equippedItem ? `Wearing ${equippedItem.name}. ` : 'Nothing equipped. '}
            <Link to="/rewards" className="font-semibold no-underline hover:underline">Change in your collection</Link>
          </p>
        </section>

        <section className="card grid gap-3" aria-labelledby="chat-heading">
          <h2 id="chat-heading">Chat</h2>
          <PetChat onReply={() => react('hearts')} />
        </section>
      </div>
    </div>
  );
}
