import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import Home from './pages/Home.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Pets from './pages/Pets.jsx';

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/pets" element={<Pets />} />
    </Routes>
  );
}
