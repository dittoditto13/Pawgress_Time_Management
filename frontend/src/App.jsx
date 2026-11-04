import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import Home from './pages/Home.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Routes:  /login and /signup are for signed-out users, / is the app (signed in or guest).
// Anything else redirects to /, which redirects to /login if nobody is signed in.
export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <p className="grid min-h-screen place-items-center text-sm text-neutral-500">Loading…</p>;

  return (
    <Routes>
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage mode="login" />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <AuthPage mode="signup" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
