import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, LayoutDashboard, Search, ShoppingCart } from 'lucide-react';
import { getCategories } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../context/TenantContext';
import { useTenantNavigate, useTenantPath } from '../../hooks/useTenantNavigate';
import type { Category } from '../../types';

export function Navbar() {
  const { user, token, logout, isAdmin } = useAuth();
  const { cartCount, clearCartContext } = useCart();
  const { tenant } = useTenant();
  const tenantNavigate = useTenantNavigate();
  const tenantPath = useTenantPath();
  const [searchParams] = useSearchParams();
  const isLoggedIn = Boolean(token);

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('search') ?? '',
  );

  const displayName =
    user?.name ?? user?.email?.split('@')[0] ?? 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    setSearchQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (!tenant?.tenantId) {
      setCategories([]);
      return;
    }

    let cancelled = false;
    getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, [tenant?.tenantId]);

  const handleLogout = () => {
    clearCartContext();
    logout();
    tenantNavigate('/');
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      tenantNavigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      tenantNavigate('/products');
    }
  };

  const primaryColor = tenant?.primaryColor ?? 'var(--color-primary)';
  const badgeCount = isLoggedIn ? cartCount : 0;

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-200 shadow-sm"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          to={tenantPath('/')}
          className="flex shrink-0 items-center gap-2 text-white"
        >
          {tenant?.logoUrl ? (
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white/40">
              <img
                src={tenant.logoUrl}
                alt={tenant.storeName}
                className="size-full object-cover"
              />
            </span>
          ) : (
            <span className="text-lg font-bold tracking-tight sm:text-xl">
              {tenant?.storeName ?? 'ShopHub'}
            </span>
          )}
        </Link>

        <form
          className="mx-auto hidden min-w-0 max-w-xl flex-1 md:flex"
          onSubmit={handleSearch}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {isAdmin && (
            <Link
              to={tenantPath('/admin/products')}
              className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/15 sm:inline-flex sm:px-3 sm:text-sm"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              Admin
            </Link>
          )}

          <Link
            to={isLoggedIn ? tenantPath('/wishlist') : tenantPath('/login')}
            state={
              isLoggedIn
                ? undefined
                : { message: 'Please login to view your wishlist' }
            }
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/15"
            aria-label="Wishlist"
          >
            <Heart className="size-6" />
          </Link>

          <Link
            to={isLoggedIn ? tenantPath('/cart') : tenantPath('/login')}
            state={
              isLoggedIn ? undefined : { message: 'Please login to view your cart' }
            }
            className="relative rounded-lg p-2 text-white transition-colors hover:bg-white/15"
            aria-label={`Cart${badgeCount > 0 ? `, ${badgeCount} items` : ''}`}
          >
            <ShoppingCart className="size-6" />
            {badgeCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white ring-2 ring-white">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to={tenantPath('/profile')}
                className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-white transition-colors hover:bg-white/15 sm:px-2"
              >
                <span
                  className="flex size-8 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  {avatarInitial}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium md:inline">
                  {displayName}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-white/40 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/15 sm:px-3 sm:text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to={tenantPath('/login')}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/15 sm:px-3 sm:text-sm"
              >
                Login
              </Link>
              <Link
                to={tenantPath('/register')}
                className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium transition-colors hover:bg-white/90 sm:px-3 sm:text-sm"
                style={{ color: primaryColor }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <form
        className="border-t border-white/20 px-4 py-2 md:hidden"
        onSubmit={handleSearch}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </form>

      {categories.length > 0 && (
        <nav
          className="border-t border-white/20 bg-white/95"
          aria-label="Product categories"
        >
          <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
            <li className="shrink-0">
              <Link
                to={tenantPath('/products')}
                className="block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-[var(--color-primary)] sm:px-4 sm:text-sm"
              >
                All
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id} className="shrink-0">
                <Link
                  to={`${tenantPath('/products')}?categoryId=${category.id}`}
                  className="block whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-100 hover:text-[var(--color-primary)] sm:px-4 sm:text-sm"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
