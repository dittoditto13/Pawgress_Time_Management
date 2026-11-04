import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trash2, UserX } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';

export default function Settings() {
  const { user, removeAccount } = useAuth();
  const { settings, updateSettings, loadDemoData, resetData, tasks } = useData();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null); // 'reset' | 'delete'
  const [notice, setNotice] = useState('');

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="page max-w-2xl">
      <div>
        <h1>Settings</h1>
        <p className="text-ink-soft">Signed in as {user.email}</p>
      </div>

      <section className="card grid content-start gap-3" aria-labelledby="pet-set">
        <h2 id="pet-set">Pet</h2>
        <label className="flex cursor-pointer items-center justify-between gap-4 pb-2">
          <span className="grid">
            <strong>Show my pet</strong>
            <small className="text-ink-soft">Displays your pet on every page to keep you motivated.</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.petEnabled}
            onChange={(e) => updateSettings({ petEnabled: e.target.checked })}
            className="relative h-7.5 w-13 shrink-0 cursor-pointer appearance-none rounded-full bg-line transition checked:bg-violet after:absolute after:left-[3px] after:top-[3px] after:size-6 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] checked:after:translate-x-[22px]"
          />
        </label>
        <label className="field">
          <span>Pet name</span>
          <input className="input" value={settings.petName} maxLength={16} onChange={(e) => updateSettings({ petName: e.target.value || 'Biscuit' })} />
        </label>
      </section>

      <section className="card grid content-start gap-3" aria-labelledby="data-set">
        <h2 id="data-set">Your data</h2>
        <p className="text-ink-soft">
          {tasks.length} task{tasks.length === 1 ? '' : 's'} saved. Data is stored in this browser for this prototype.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className="btn btn-outline" onClick={() => { loadDemoData(); flash('Added 8 days of sample progress. Check your streak and rewards.'); }}>
            <Sparkles className="size-4" aria-hidden="true" />
            Load sample progress
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setConfirm('reset')}>
            <Trash2 className="size-4" aria-hidden="true" />
            Clear schedule and rewards
          </button>
        </div>
        {notice && <p className="rounded-xl bg-mint-tint px-3.5 py-2.5 font-semibold text-mint-dark" role="status">{notice}</p>}
      </section>

      <section className="card grid content-start justify-items-start gap-3 border-2 border-coral-tint" aria-labelledby="acct-set">
        <h2 id="acct-set">Account</h2>
        <button type="button" className="btn btn-danger" onClick={() => setConfirm('delete')}>
          <UserX className="size-4" aria-hidden="true" />
          Delete account
        </button>
      </section>

      {confirm === 'reset' && (
        <Modal title="Clear all progress?" onClose={() => setConfirm(null)}>
          <p>This removes every task, your streak history, and your collected items. This can’t be undone.</p>
          <div className="flex justify-end gap-2.5">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={() => { resetData(); setConfirm(null); flash('Progress cleared.'); }}>Clear progress</button>
          </div>
        </Modal>
      )}
      {confirm === 'delete' && (
        <Modal title="Delete your account?" onClose={() => setConfirm(null)}>
          <p>Your account, schedule, streak, and rewards will be deleted permanently.</p>
          <div className="flex justify-end gap-2.5">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={() => { removeAccount(); navigate('/'); }}>Delete account</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
