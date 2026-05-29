import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  FolderTree,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useTenantPath } from '../../hooks/useTenantNavigate';

const navItems = [
  { to: 'products', label: 'Products', icon: Package },
  { to: 'categories', label: 'Categories', icon: FolderTree },
  { to: 'orders', label: 'Orders', icon: ShoppingBag },
  { to: 'customers', label: 'Customers', icon: Users },
] as const;

export function AdminLayout() {
  const { tenant } = useTenant();
  const tenantPath = useTenantPath();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-5">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <LayoutDashboard className="size-5" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Admin
            </span>
          </div>
          <p className="mt-2 truncate text-sm font-medium text-gray-900">
            {tenant?.storeName ?? 'Store'}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={tenantPath(`/admin/${to}`)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <Link
            to={tenantPath('/')}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Store className="size-4" aria-hidden />
            View storefront
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-64">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur">
          <h1 className="text-lg font-semibold text-gray-900">Store administration</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
