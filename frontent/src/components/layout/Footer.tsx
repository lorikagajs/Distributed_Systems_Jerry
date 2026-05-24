import { Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useTenantPath } from '../../hooks/useTenantNavigate';

const FOOTER_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Terms', path: '/terms' },
  { label: 'Privacy', path: '/privacy' },
] as const;

export function Footer() {
  const { tenant } = useTenant();
  const tenantPath = useTenantPath();
  const year = new Date().getFullYear();
  const storeName = tenant?.storeName ?? 'ShopHub';

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center gap-6" aria-label="Footer">
          {FOOTER_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              to={tenantPath(path)}
              className="text-sm text-gray-600 transition-colors hover:text-[var(--color-primary)]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-gray-500">
          &copy; {year} {storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
