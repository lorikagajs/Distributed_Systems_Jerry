import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { useTenantPath } from '../hooks/useTenantNavigate';

export function NotFoundPage() {
  const { slug } = useTenant();
  const tenantPath = useTenantPath();
  const homeTo = slug ? tenantPath('/') : '/';

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <SearchX className="size-12" aria-hidden />
      </div>
      <p className="mt-6 text-6xl font-bold text-gray-200">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 max-w-md text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        to={homeTo}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Home className="size-4" aria-hidden />
        Go Home
      </Link>
    </div>
  );
}
