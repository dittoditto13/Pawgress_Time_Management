import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-100 grid place-items-center bg-ink/55 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="grid max-h-[90vh] w-full max-w-md gap-4 overflow-auto rounded-3xl bg-white p-6 shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
