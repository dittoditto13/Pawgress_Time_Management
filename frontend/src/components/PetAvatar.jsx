import { useId } from 'react';
import clsx from 'clsx';

const MOOD_LABEL = { happy: 'Happy', idle: 'Idle', sad: 'Sad', sleeping: 'Sleeping' };

// Body animation per state, and per tap reaction (reaction wins while it plays).
const STATE_ANIM = {
  happy: 'animate-wiggle',
  idle: 'animate-breathe',
  sad: 'translate-y-1 scale-y-[0.97]',
  sleeping: 'animate-breathe [animation-duration:4.5s]',
};
const REACTION_ANIM = {
  bounce: 'animate-bounce-tap',
  spin: 'animate-spin-tap',
  hearts: 'animate-wiggle-fast',
};

// Draws the pet for one of four states. `reaction` plays a tap animation: 'bounce' | 'spin' | 'hearts'.
export default function PetAvatar({ state = 'idle', reaction = null, accessory = null, size = 160, label, className }) {
  const uid = useId();
  return (
    <div
      className={clsx('relative mx-auto block shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label || `${MOOD_LABEL[state]} pet`}
    >
      <svg viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-body`} cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#FFE08A" />
            <stop offset="100%" stopColor="#FFC145" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="184" rx="52" ry="8" fill="rgba(27,23,64,.14)" />
        <g className={clsx('origin-[50%_90%] [transform-box:fill-box]', reaction ? REACTION_ANIM[reaction] : STATE_ANIM[state])}>
          <path d="M52 62 L44 20 L88 48 Z" fill="#FFB02E" />
          <path d="M148 62 L156 20 L112 48 Z" fill="#FFB02E" />
          <path d="M55 52 L52 32 L72 46 Z" fill="#FF8FA3" />
          <path d="M145 52 L148 32 L128 46 Z" fill="#FF8FA3" />
          <circle cx="100" cy="106" r="74" fill={`url(#${uid}-body)`} />
          <ellipse cx="100" cy="142" rx="34" ry="24" fill="#FFF2C9" opacity=".8" />
          <circle cx="58" cy="118" r="10" fill="#FF8FA3" opacity={state === 'happy' ? 0.7 : 0.35} />
          <circle cx="142" cy="118" r="10" fill="#FF8FA3" opacity={state === 'happy' ? 0.7 : 0.35} />
          <Face state={state} />
          {accessory && (
            <text x="100" y="42" textAnchor="middle" fontSize="54">{accessory}</text>
          )}
        </g>
        {state === 'sleeping' && (
          <g className="animate-floatz" fill="#5b3df5" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800">
            <text x="150" y="60" fontSize="26">z</text>
            <text x="166" y="38" fontSize="20">z</text>
            <text x="178" y="20" fontSize="15">z</text>
          </g>
        )}
      </svg>
      {reaction === 'hearts' && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {['💜', '💛', '💜'].map((h, i) => (
            <span
              key={i}
              className="absolute bottom-[55%] animate-rise text-2xl opacity-0"
              style={{ left: `${22 + i * 24}%`, animationDelay: `${i * 0.15}s` }}
            >
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Face({ state }) {
  const ink = '#1B1740';
  if (state === 'happy') {
    return (
      <g>
        <path d="M66 98q12-16 24 0" stroke={ink} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M110 98q12-16 24 0" stroke={ink} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M78 120q22 26 44 0z" fill={ink} />
        <path d="M90 130q10 8 20 0" fill="#FF6B81" />
      </g>
    );
  }
  if (state === 'sad') {
    return (
      <g>
        <circle cx="78" cy="106" r="8" fill={ink} />
        <circle cx="122" cy="106" r="8" fill={ink} />
        <circle cx="75" cy="103" r="2.6" fill="#fff" />
        <circle cx="119" cy="103" r="2.6" fill="#fff" />
        <path d="M62 88l22 6M138 88l-22 6" stroke={ink} strokeWidth="5" strokeLinecap="round" />
        <path d="M84 134q16-14 32 0" stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M74 118q-5 10 0 14q5-4 0-14z" fill="#6EC8FF" className="animate-tear" />
      </g>
    );
  }
  if (state === 'sleeping') {
    return (
      <g>
        <path d="M66 104q12 10 24 0" stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M110 104q12 10 24 0" stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M90 128q10 6 20 0" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <g className="origin-center animate-blink [transform-box:fill-box]">
        <circle cx="78" cy="104" r="8" fill={ink} />
        <circle cx="122" cy="104" r="8" fill={ink} />
        <circle cx="75" cy="101" r="2.6" fill="#fff" />
        <circle cx="119" cy="101" r="2.6" fill="#fff" />
      </g>
      <path d="M86 126q14 12 28 0" stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  );
}
