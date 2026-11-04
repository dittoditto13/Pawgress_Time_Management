import { Link } from 'react-router-dom';
import PetAvatar from '../components/PetAvatar.jsx';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-content-center justify-items-center gap-3.5 p-6 text-center">
      <PetAvatar state="sad" size={180} />
      <h1>Page not found</h1>
      <p className="text-ink-soft">That page doesn’t exist. Head back and pick up your streak.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}
