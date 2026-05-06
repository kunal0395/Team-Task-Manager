import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}