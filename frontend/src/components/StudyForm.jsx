import { useState } from 'react';
import { useBuddy } from '../context/BuddyContext.jsx';

// Log a study session (1-600 minutes). The backend awards XP and updates the streak.
export default function StudyForm() {
  const { logSession } = useBuddy();
  const [minutes, setMinutes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');
    const n = Number(minutes);
    if (!Number.isInteger(n) || n < 1 || n > 600) return setError('Enter a whole number of minutes from 1 to 600.');
    setBusy(true);
    try {
      const { xpGained, leveledUp } = await logSession(n);
      setResult(`+${xpGained} XP${leveledUp ? '. Level up!' : ''}`);
      setMinutes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="card grid gap-2" aria-label="Log study session">
      <div className="flex items-end gap-2">
        <label className="label flex-1">
          Log a study session (minutes)
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="600"
            className="input"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="e.g. 45"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Log session'}</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {result && <p role="status" className="text-sm font-medium text-emerald-700">{result}</p>}
    </form>
  );
}
