import { Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { BAR_SIZE } from '../utils/streak.js';
import { useData } from '../context/DataContext.jsx';

// Seven segments: one fills per streak day. Filling the bar earns a loot box.
export default function RewardBar() {
  const { streak, unopenedBoxes } = useData();
  const filled = streak.barDays;
  const left = BAR_SIZE - filled;

  return (
    <div className="grid gap-2.5">
      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={BAR_SIZE}
        aria-valuenow={filled}
        aria-label="Loot box progress"
      >
        {Array.from({ length: BAR_SIZE }, (_, i) => (
          <span key={i} className="h-5 flex-1 overflow-hidden rounded-lg bg-violet-tint">
            <motion.span
              className="block size-full rounded-lg bg-linear-to-b from-[#8d75ff] to-violet"
              initial={false}
              animate={{ scaleX: i < filled ? 1 : 0 }}
              style={{ originX: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            />
          </span>
        ))}
        <Gift className="ml-1 size-7 shrink-0 text-violet" aria-hidden="true" />
      </div>
      <p className="text-sm text-ink-soft">
        {filled}/{BAR_SIZE} days.{' '}
        {left === BAR_SIZE
          ? 'Complete a day to start filling the bar.'
          : `${left} more streak day${left === 1 ? '' : 's'} until your next loot box.`}
        {unopenedBoxes > 0 && ` You have ${unopenedBoxes} unopened.`}
      </p>
    </div>
  );
}
