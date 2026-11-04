import { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import Modal from './Modal.jsx';
import ItemCard from './ItemCard.jsx';
import { useData } from '../context/DataContext.jsx';

export default function LootBoxModal({ onClose }) {
  const { openBox, unopenedBoxes } = useData();
  const [item, setItem] = useState(null);
  const [shaking, setShaking] = useState(false);

  const open = () => {
    setShaking(true);
    setTimeout(() => {
      setItem(openBox());
      setShaking(false);
    }, 700);
  };

  return (
    <Modal title="Loot box" onClose={onClose}>
      <div className="grid justify-items-center gap-3.5 py-2 text-center">
        {!item ? (
          <>
            <Gift className={clsx('size-28 text-violet', shaking && 'animate-shake')} strokeWidth={1.5} aria-hidden="true" />
            <p className="text-ink-soft">{unopenedBoxes} loot box{unopenedBoxes === 1 ? '' : 'es'} ready to open.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={open} disabled={shaking || unopenedBoxes === 0}>
              {shaking ? 'Opening…' : 'Open loot box'}
            </button>
          </>
        ) : (
          <>
            <p className="font-bold text-ink-soft">You got</p>
            <motion.div
              className="w-48"
              initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 15 }}
            >
              <ItemCard item={item} count={1} large />
            </motion.div>
            <div className="flex justify-center gap-2.5">
              {unopenedBoxes > 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => setItem(null)}>
                  Open another ({unopenedBoxes})
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
