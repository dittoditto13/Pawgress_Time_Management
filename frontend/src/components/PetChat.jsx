import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Send } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { petReply } from '../utils/pet.js';

export default function PetChat({ onReply }) {
  const { settings, streak } = useData();
  const [text, setText] = useState('');
  const [log, setLog] = useState(() => [
    { from: 'pet', text: `Hi! I’m ${settings.petName}. Try typing “hi”, “feed”, “play”, “streak”, or “help”.` },
  ]);
  const logRef = useRef(null);

  // Scroll only the chat box, never the page.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const send = (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    const reply = petReply(msg, settings.petName, streak);
    setLog((l) => [...l, { from: 'me', text: msg }, { from: 'pet', text: reply }]);
    setText('');
    onReply?.();
  };

  return (
    <div className="grid gap-3">
      <div
        ref={logRef}
        className="flex h-80 flex-col gap-2 overflow-y-auto p-1"
        role="log"
        aria-live="polite"
        aria-label={`Chat with ${settings.petName}`}
      >
        {log.map((m, i) => (
          <p
            key={i}
            className={clsx(
              'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.95rem]',
              m.from === 'pet' ? 'self-start rounded-bl-sm bg-violet-tint' : 'self-end rounded-br-sm bg-ink text-white'
            )}
          >
            {m.text}
          </p>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={send}>
        <label className="sr-only" htmlFor="pet-input">Message your pet</label>
        <input
          id="pet-input"
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Say something to ${settings.petName}`}
          maxLength={120}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary" aria-label="Send message">
          <Send className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
