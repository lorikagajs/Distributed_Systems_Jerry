import { Navigate, Outlet, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export function AdminRoute() {
  const { token, isAdmin, authLoading } = useAuth();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  if (!token) {
    return <Navigate to={`/${tenantSlug}/login`} replace />;
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={`/${tenantSlug}/`} replace />;
  }

  return <Outlet />;
}
