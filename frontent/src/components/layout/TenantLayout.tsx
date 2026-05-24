import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { StoreNotFound } from './StoreNotFound';

export function TenantLayout() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { tenant, loading, error, loadTenant } = useTenant();

  useEffect(() => {
    if (!tenantSlug) return;
    void loadTenant(tenantSlug);
  }, [tenantSlug, loadTenant]);

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
