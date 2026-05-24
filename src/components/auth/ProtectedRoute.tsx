import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { token } = useAuth();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  if (!token) {
    return <Navigate to={`/${tenantSlug}/login`} replace />;
  }

  return <Outlet />;
}
