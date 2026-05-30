import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getAllTenants, type TenantListItem } from '../api/tenants';
import { TenantBannerImage } from '../components/tenant/TenantBannerImage';
import { getApiErrorMessage } from '../api/auth';
import { isMockMode } from '../config/env';
import { useTenant } from '../context/TenantContext';

export function TenantSelectorPage() {
  const { clearTenant } = useTenant();
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    clearTenant();
  }, [clearTenant]);

  useEffect(() => {
    getAllTenants()
      .then(setTenants)
      .catch((err) =>
        setError(getApiErrorMessage(err, 'Failed to load stores.')),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Jerry Store</h1>
          <p className="mt-2 text-gray-600">
            Choose a store to start shopping
          </p>
          {isMockMode() ? (
            <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Demo mode — using mock data (no backend required)
            </p>
          ) : (
            <p className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Connected to API — run backend seed, then log in per store
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="size-10 animate-spin text-indigo-600" />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && tenants.length === 0 && (
          <p className="text-center text-gray-600">No stores available yet.</p>
        )}

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((store) => (
            <li key={store.slug}>
              <Link
                to={`/${store.slug}/`}
                className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="h-28 overflow-hidden">
                  <TenantBannerImage
                    src={store.bannerUrl}
                    className="h-full w-full object-cover"
                    fallbackColor={store.primaryColor}
                    showFallbackIcon
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    {store.logoUrl ? (
                      <span
                        className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2"
                        style={{
                          backgroundColor: 'white',
                          borderColor: store.primaryColor,
                        }}
                      >
                        <img
                          src={store.logoUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      </span>
                    ) : null}
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--color-primary)]">
                      {store.storeName}
                    </h2>
                  </div>
                  {store.storeDescription && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {store.storeDescription}
                    </p>
                  )}
                  <span
                    className="mt-4 inline-block text-sm font-medium"
                    style={{ color: store.primaryColor }}
                  >
                    Visit store →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
