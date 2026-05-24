import { Link } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useTenantNavigate, useTenantPath } from '../../hooks/useTenantNavigate';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Beauty',
  'Toys',
  'Automotive',
  'Health',
  'Groceries',
];

const CART_ITEM_COUNT = 0;

export function Navbar() {
  const { user, token, logout } = useAuth();
  const { tenant } = useTenant();
  const tenantNavigate = useTenantNavigate();
  const tenantPath = useTenantPath();
  const isLoggedIn = Boolean(token);

  const displayName =
    user?.name ?? user?.username ?? user?.email?.split('@')[0] ?? 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    tenantNavigate('/');
  };

  const primaryColor = tenant?.primaryColor ?? 'var(--color-primary)';

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-200 shadow-sm"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to={tenantPath('/')}
          className="flex shrink-0 items-center gap-2 text-white"
        >
          {tenant?.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.storeName}
              className="h-8 w-auto max-w-[140px] object-contain"
            />
          ) : (
            <span className="text-xl font-bold tracking-tight">
              {tenant?.storeName ?? 'ShopHub'}
            </span>
          )}
        </Link>

        <form
          className="mx-auto hidden min-w-0 max-w-xl flex-1 sm:flex"
          onSubmit={(e) => e.preventDefault()}
          role="search"
        >
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            to={tenantPath('/cart')}
            className="relative rounded-lg p-2 text-white transition-colors hover:bg-white/15"
            aria-label={`Cart, ${CART_ITEM_COUNT} items`}
          >
            <ShoppingCart className="size-6" />
            {CART_ITEM_COUNT > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                {CART_ITEM_COUNT > 99 ? '99+' : CART_ITEM_COUNT}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to={tenantPath('/profile')}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white transition-colors hover:bg-white/15"
              >
                <span
                  className="flex size-8 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  {avatarInitial}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                  {displayName}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-white/40 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={tenantPath('/login')}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
              >
                Login
              </Link>
              <Link
                to={tenantPath('/register')}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/90"
                style={{ color: primaryColor }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <form
        className="border-t border-white/20 px-4 py-2 sm:hidden"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </form>

      <nav
        className="border-t border-white/20 bg-white/95"
        aria-label="Product categories"
      >
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {CATEGORIES.map((category) => (
            <li key={category} className="shrink-0">
              <Link
                to={`${tenantPath('/products')}?category=${encodeURIComponent(category)}`}
                className="block whitespace-nowrap rounded-full px-4 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-[var(--color-primary)]"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
