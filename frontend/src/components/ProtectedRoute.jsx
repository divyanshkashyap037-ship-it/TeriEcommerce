import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Blocks protected pages when not logged in.
// Pass roles={['seller']} for seller-only pages (UX only —
// the backend re-checks the role on every write request).
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <p className="center">Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/products" replace />;
  return children;
}
