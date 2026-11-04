// Pet is a small state machine driven by streak status.
//   sleeping : late night / early morning (22:00 - 06:59)
//   happy    : today already counts toward the streak
//   sad      : yesterday was missed and today does not count yet
//   idle     : everything else
export const PET_STATES = ['happy', 'idle', 'sad', 'sleeping'];

export function getPetState(streak, now = new Date()) {
  const hour = now.getHours();
  if (hour >= 22 || hour < 7) return 'sleeping';
  if (streak.today.status === 'counted') return 'happy';
  if (streak.yesterdayMissed) return 'sad';
  return 'idle';
}

export const STATE_LINES = {
  happy: 'Day counted! I’m so proud of you.',
  idle: 'Ready when you are. Check off a task?',
  sad: 'I missed you yesterday. Let’s restart the streak today.',
  sleeping: 'Zzz… wake me up tomorrow.',
};

// Three distinct tap reactions.
export const TAP_REACTIONS = ['bounce', 'spin', 'hearts'];

export function nextReaction(prev) {
  const options = TAP_REACTIONS.filter((r) => r !== prev);
  return options[Math.floor(Math.random() * options.length)];
}

// Typed-word recognition: at least 5 keywords plus a default reply.
const KEYWORDS = [
  { words: ['hi', 'hello', 'hey'], reply: (n) => `Hi! I’m ${n}. Ready to crush today’s tasks?` },
  { words: ['feed', 'hungry', 'food', 'snack'], reply: () => 'Nom nom! Snacks taste better after a finished task.' },
  { words: ['play', 'game', 'fun'], reply: () => 'Let’s play after your next task. Deal?' },
  { words: ['streak'], reply: (_n, ctx) => `Your streak is ${ctx.current} day${ctx.current === 1 ? '' : 's'} and your best is ${ctx.longest}.` },
  { words: ['sleep', 'tired', 'nap'], reply: () => 'Rest is part of the plan. Even I take naps.' },
  { words: ['love', 'thanks', 'thank'], reply: () => 'Aww, I love you too! Now go finish a task.' },
  { words: ['help', 'stuck', 'procrastinate'], reply: () => 'Pick the smallest task on your list and do just that one.' },
];

export const KEYWORD_COUNT = KEYWORDS.length;

export function petReply(text, petName, ctx) {
  const tokens = text.toLowerCase().match(/[a-z']+/g) || [];
  for (const k of KEYWORDS) {
    if (k.words.some((w) => tokens.includes(w))) return k.reply(petName, ctx);
  }
  return `I’m not sure what “${text.trim()}” means yet. Try “hi”, “feed”, “play”, “streak”, or “help”.`;
}
