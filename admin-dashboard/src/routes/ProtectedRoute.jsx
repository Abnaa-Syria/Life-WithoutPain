import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * Guards routes by permission (primary) with optional legacy role fallback.
 * @param {string} [permission] - single permission key
 * @param {string[]} [permissions] - any-of permission keys
 * @param {string[]} [roles] - legacy role allow-list
 */
export default function ProtectedRoute({ children, permission, permissions, roles }) {
  const { user, loading, isAuthenticated, canRoute } = useAuth();

  if (loading) return <LoadingSpinner size="lg" />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const allowed = canRoute({
    permission,
    permissions,
    roles,
  });

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
