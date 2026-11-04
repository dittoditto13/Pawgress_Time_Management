import clsx from 'clsx';
import { RARITIES } from '../data/items.js';

const BORDER = { common: 'border-t-common', rare: 'border-t-rare', legendary: 'border-t-legendary' };
const TEXT = { common: 'text-common', rare: 'text-rare', legendary: 'text-legendary' };
const BG = {
  common: 'bg-white',
  rare: 'bg-linear-to-br from-white from-50% to-[#e3eeff]',
  legendary: 'bg-linear-to-br from-white from-50% to-[#fff2cc]',
};

export default function ItemCard({ item, count = 0, owned = true, equipped = false, onEquip, large = false }) {
  const rarity = RARITIES[item.rarity];
  return (
    <div
      className={clsx(
        'grid content-start justify-items-center gap-1 rounded-2xl border-2 border-t-[6px] border-line px-2.5 py-4 text-center',
        BORDER[item.rarity],
        owned ? BG[item.rarity] : 'border-dashed bg-white opacity-55',
        equipped && 'ring-3 ring-violet'
      )}
    >
      <div className={clsx('leading-tight', large ? 'text-7xl' : 'text-4xl')} aria-hidden="true">
        {owned ? item.emoji : '❔'}
      </div>
      <p className="font-bold">{owned ? item.name : 'Not found yet'}</p>
      <p className={clsx('text-xs font-bold', TEXT[item.rarity])}>
        {rarity.label}{owned && count > 1 ? ` · ×${count}` : ''}
      </p>
      {owned && large && <p className="text-sm text-ink-soft">{item.blurb}</p>}
      {owned && onEquip && (
        <button
          type="button"
          className={clsx('btn btn-sm mt-1.5', equipped ? 'btn-ghost' : 'btn-outline')}
          onClick={() => onEquip(equipped ? null : item.id)}
        >
          {equipped ? 'Remove' : 'Equip'}
        </button>
      )}
    </div>
  );
}
