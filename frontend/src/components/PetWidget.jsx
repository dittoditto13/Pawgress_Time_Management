import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PetAvatar from './PetAvatar.jsx';
import { useData } from '../context/DataContext.jsx';
import { STATE_LINES, nextReaction } from '../utils/pet.js';

// Floating pet shown on every signed-in page (when the user has it turned on).
export default function PetWidget() {
  const { settings, petState, equippedItem } = useData();
  const location = useLocation();
  const [reaction, setReaction] = useState(null);
  const [bubble, setBubble] = useState(false);
  const timer = useRef();

  useEffect(() => () => clearTimeout(timer.current), []);

  // The dashboard and pet pages already show the pet, so the floating one stays hidden there.
  if (!settings.petEnabled || ['/pet', '/dashboard'].includes(location.pathname)) return null;

  const tap = () => {
    setReaction((r) => nextReaction(r));
    setBubble(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setReaction(null);
      setBubble(false);
    }, 2200);
  };

  return (
    <aside
      className="fixed bottom-24 right-3 z-40 grid justify-items-end gap-2 md:bottom-5 md:right-5"
      aria-label={`${settings.petName}, your pet`}
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            className="grid max-w-64 gap-1 rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-white"
            role="status"
          >
            <p><strong>{settings.petName}:</strong> {STATE_LINES[petState]}</p>
            <Link to="/pet" className="font-bold text-sun">Chat with {settings.petName}</Link>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={tap}
        aria-label={`Pet ${settings.petName}`}
        className="cursor-pointer rounded-full border-[3px] border-ink bg-white p-1.5 shadow-[0_8px_20px_-8px_rgb(27_23_64/0.5)]"
      >
        <PetAvatar state={petState} reaction={reaction} accessory={equippedItem?.emoji} size={84} />
      </motion.button>
    </aside>
  );
}
