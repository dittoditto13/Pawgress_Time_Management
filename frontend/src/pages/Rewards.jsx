import { useState } from 'react';
import { Gift } from 'lucide-react';
import RewardBar from '../components/RewardBar.jsx';
import Inventory from '../components/Inventory.jsx';
import LootBoxModal from '../components/LootBoxModal.jsx';
import { useData } from '../context/DataContext.jsx';
import { BAR_SIZE } from '../utils/streak.js';
import { ITEMS, RARITIES } from '../data/items.js';

const DOT = { common: 'bg-common', rare: 'bg-rare', legendary: 'bg-legendary' };

export default function Rewards() {
  const { streak, unopenedBoxes, boxesOpened } = useData();
  const [opening, setOpening] = useState(false);

  return (
    <div className="page">
      <div>
        <h1>Rewards</h1>
        <p className="text-ink-soft">Each streak day fills 1/7 of the bar. A full bar earns a loot box.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <section className="card grid content-start gap-3" aria-labelledby="bar-heading">
          <h2 id="bar-heading">Loot box progress</h2>
          <RewardBar />
          <p className="text-sm text-ink-soft">If you miss a day, the bar resets to 0. Boxes you already earned are yours to keep.</p>
        </section>

        <section className="card grid content-start justify-items-start gap-2.5" aria-labelledby="box-heading">
          <h2 id="box-heading">Loot boxes</h2>
          <div className="flex items-center gap-3.5">
            <Gift className="size-12 text-violet" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-display text-6xl font-extrabold leading-none tracking-tighter">{unopenedBoxes}</p>
          </div>
          <p className="text-ink-soft">
            {unopenedBoxes > 0 ? 'Ready to open.' : `${BAR_SIZE - streak.barDays} more streak day${BAR_SIZE - streak.barDays === 1 ? '' : 's'} until the next one.`}
            {boxesOpened > 0 && ` ${boxesOpened} opened so far.`}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setOpening(true)} disabled={unopenedBoxes === 0}>
            Open a loot box
          </button>
        </section>
      </div>

      <section className="card"><Inventory /></section>

      <section className="card" aria-labelledby="odds-heading">
        <h2 id="odds-heading">Drop rates</h2>
        <ul className="mt-3 grid gap-2">
          {Object.entries(RARITIES).map(([key, r]) => (
            <li key={key} className="flex flex-wrap items-center gap-2.5">
              <span className={`size-3.5 rounded-full ${DOT[key]}`} aria-hidden="true" />
              <strong>{r.label}</strong>
              <span className="text-ink-soft">{ITEMS.filter((i) => i.rarity === key).length} items · {r.weight}% per box</span>
            </li>
          ))}
        </ul>
      </section>

      {opening && <LootBoxModal onClose={() => setOpening(false)} />}
    </div>
  );
}
