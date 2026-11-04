import { useMemo, useState } from 'react';
import ItemCard from './ItemCard.jsx';
import { ITEMS, RARITIES } from '../data/items.js';
import { useData } from '../context/DataContext.jsx';

export default function Inventory() {
  const { inventory, equipped, equip } = useData();
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => {
    const m = {};
    inventory.forEach((id) => { m[id] = (m[id] || 0) + 1; });
    return m;
  }, [inventory]);

  const found = ITEMS.filter((i) => counts[i.id]).length;
  const shown = ITEMS.filter((i) => filter === 'all' || i.rarity === filter);

  return (
    <section aria-labelledby="inv-heading">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 id="inv-heading">Collection</h2>
        <p className="text-ink-soft">{found} of {ITEMS.length} found</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by rarity">
        {['all', ...Object.keys(RARITIES)].map((f) => (
          <button key={f} type="button" className="pill" onClick={() => setFilter(f)} aria-pressed={filter === f}>
            {f === 'all' ? 'All' : RARITIES[f].label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
        {shown.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            count={counts[item.id] || 0}
            owned={Boolean(counts[item.id])}
            equipped={equipped === item.id}
            onEquip={equip}
          />
        ))}
      </div>
    </section>
  );
}
