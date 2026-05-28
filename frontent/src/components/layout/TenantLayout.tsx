import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../context/TenantContext';
import { StoreNotFound } from './StoreNotFound';

export function TenantLayout() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { tenant, loading, error, loadTenant } = useTenant();
  const { user, token, logout } = useAuth();
  const { clearCartContext } = useCart();

  useEffect(() => {
    if (!tenantSlug) return;
    void loadTenant(tenantSlug);
  }, [tenantSlug, loadTenant]);

  useEffect(() => {
    if (!token || !user?.tenantId || !tenant?.tenantId) return;
    if (user.tenantId !== tenant.tenantId) {
      clearCartContext();
      logout();
    }
  }, [token, user?.tenantId, tenant?.tenantId, clearCartContext, logout]);

  if (!tenantSlug) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2
          className="size-10 animate-spin text-[var(--color-primary)]"
          aria-label="Loading store"
        />
      </div>
    );
  }

  if (error || !tenant || tenant.slug !== tenantSlug) {
    return <StoreNotFound slug={tenantSlug} message={error} />;
  }

  return <Outlet />;
}
