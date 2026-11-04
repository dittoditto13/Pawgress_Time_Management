// Reward item pool: 15 collectibles across 3 rarities.
// Keep ALL item definitions in this one file so the design team can add items
// without touching any component code.

export const RARITIES = {
  common: { label: 'Common', weight: 70, color: 'var(--rarity-common)' },
  rare: { label: 'Rare', weight: 25, color: 'var(--rarity-rare)' },
  legendary: { label: 'Legendary', weight: 5, color: 'var(--rarity-legendary)' },
};

export const ITEMS = [
  // Common (7)
  { id: 'cap', name: 'Study Cap', emoji: '🧢', rarity: 'common', blurb: 'For long reading sessions.' },
  { id: 'glasses', name: 'Round Glasses', emoji: '👓', rarity: 'common', blurb: 'Instantly looks smarter.' },
  { id: 'bow', name: 'Tiny Bow', emoji: '🎀', rarity: 'common', blurb: 'Small but stylish.' },
  { id: 'scarf', name: 'Cozy Scarf', emoji: '🧣', rarity: 'common', blurb: 'Warm for library nights.' },
  { id: 'headphones', name: 'Focus Headphones', emoji: '🎧', rarity: 'common', blurb: 'Lo-fi on, distractions off.' },
  { id: 'flower', name: 'Daisy', emoji: '🌼', rarity: 'common', blurb: 'A little bit of spring.' },
  { id: 'coffee', name: 'Iced Coffee', emoji: '🧋', rarity: 'common', blurb: 'Fuel for the 8 AM.' },
  // Rare (5)
  { id: 'beanie', name: 'Snow Beanie', emoji: '⛄', rarity: 'rare', blurb: 'Perfect for walking to class in November.' },
  { id: 'wizard', name: 'Wizard Hat', emoji: '🧙', rarity: 'rare', blurb: 'Master of the midterm.' },
  { id: 'shades', name: 'Cool Shades', emoji: '😎', rarity: 'rare', blurb: 'Too cool for procrastination.' },
  { id: 'rocket', name: 'Rocket Pack', emoji: '🚀', rarity: 'rare', blurb: 'Launches your productivity.' },
  { id: 'medal', name: 'Gold Medal', emoji: '🥇', rarity: 'rare', blurb: 'First place in follow-through.' },
  // Legendary (3)
  { id: 'crown', name: 'Golden Crown', emoji: '👑', rarity: 'legendary', blurb: 'Royalty of the schedule.' },
  { id: 'dragon', name: 'Mini Dragon', emoji: '🐉', rarity: 'legendary', blurb: 'Breathes fire on deadlines.' },
  { id: 'trophy', name: 'Dean’s Trophy', emoji: '🏆', rarity: 'legendary', blurb: 'The ultimate flex.' },
];

export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

/** Weighted random draw. `rand` is injectable for tests. */
export function rollItem(rand = Math.random) {
  const total = Object.values(RARITIES).reduce((s, r) => s + r.weight, 0);
  let roll = rand() * total;
  let rarity = 'common';
  for (const [key, r] of Object.entries(RARITIES)) {
    if (roll < r.weight) {
      rarity = key;
      break;
    }
    roll -= r.weight;
  }
  const pool = ITEMS.filter((i) => i.rarity === rarity);
  return pool[Math.floor(rand() * pool.length)];
}
