import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import axios from 'axios';
import { setTenantId } from '../api/axiosInstance';
import { getTenantConfig, type TenantConfig } from '../api/tenants';

export type { TenantConfig };

export interface TenantContextType {
  tenant: TenantConfig | null;
  loading: boolean;
  error: string | null;
  slug: string | null;
  loadTenant: (slug: string) => Promise<void>;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const DEFAULT_PRIMARY = '#4f46e5';
const DEFAULT_SECONDARY = '#7c3aed';

function applyTheme(tenant: TenantConfig | null) {
  const primary = tenant?.primaryColor ?? DEFAULT_PRIMARY;
  const secondary = tenant?.secondaryColor ?? DEFAULT_SECONDARY;
  document.documentElement.style.setProperty('--color-primary', primary);
  document.documentElement.style.setProperty('--color-secondary', secondary);
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearTenant = useCallback(() => {
    setTenant(null);
    setSlug(null);
    setError(null);
    setTenantId(null);
    applyTheme(null);
  }, []);

  const loadTenant = useCallback(async (tenantSlug: string) => {
    setSlug(tenantSlug);
    setLoading(true);
    setError(null);

    try {
      const config = await getTenantConfig(tenantSlug);
      setTenant(config);
      setTenantId(config.tenantId);
      applyTheme(config);
    } catch (err) {
      setTenant(null);
      setTenantId(null);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('Tenant not found');
      } else {
        setError('Failed to load store');
      }
      applyTheme(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      tenant,
      loading,
      error,
      slug,
      loadTenant,
      clearTenant,
    }),
    [tenant, loading, error, slug, loadTenant, clearTenant],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
}

export function useTenantContext() {
  return useTenant();
}
