import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, LogOut, ChevronRight, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Beauty",
  "Books",
  "Toys",
  "Automotive",
  "Groceries",
  "Health",
  "Jewelry",
  "Tools",
];

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cart count: replace with real cart context if available
  const cartCount = 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* ── Main bar ── */}
      <div className="bg-indigo-600">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 text-white"
          >
            <span className="text-2xl font-extrabold tracking-tight">
              Shop
              <span className="text-indigo-200">Hub</span>
            </span>
          </Link>

          {/* Search — hidden on very small screens */}
          <form
            onSubmit={handleSearch}
            className="mx-4 hidden flex-1 sm:flex"
          >
            <div className="flex w-full overflow-hidden rounded-full border-2 border-indigo-400 bg-white shadow-inner transition focus-within:border-white">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and more…"
                className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex items-center gap-1 bg-yellow-400 px-4 text-sm font-semibold text-gray-800 transition hover:bg-yellow-300"
              >
                <Search size={16} />
                <span className="hidden lg:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {token && user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white transition hover:bg-indigo-500"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-white/40"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-400 text-xs font-bold text-white">
                      {user.name?.charAt(0).toUpperCase() ?? "U"}
                    </span>
                  )}
                  <span className="hidden font-medium lg:inline">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/80 transition hover:bg-indigo-500 hover:text-white"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-indigo-600 shadow transition hover:bg-indigo-50"
                >
                  Register
                </Link>
              </>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative ml-1 flex items-center gap-1 rounded-lg px-3 py-1.5 text-white transition hover:bg-indigo-500"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <span className="hidden text-sm font-medium lg:inline">Cart</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="ml-1 rounded-lg p-1.5 text-white transition hover:bg-indigo-500 sm:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="border-t border-indigo-500 px-4 pb-3 sm:hidden">
          <form onSubmit={handleSearch} className="flex mt-2">
            <div className="flex w-full overflow-hidden rounded-full border-2 border-indigo-400 bg-white shadow-inner focus-within:border-white">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="bg-yellow-400 px-4 text-sm font-semibold text-gray-800 hover:bg-yellow-300"
              >
                <Search size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Categories bar ── */}
      <nav className="bg-indigo-700 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto py-1.5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="flex shrink-0 items-center gap-0.5 rounded px-3 py-1 text-xs font-medium text-indigo-100 transition hover:bg-indigo-600 hover:text-white"
              >
                {cat}
                <ChevronRight size={12} className="opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      {mobileMenuOpen && (
        <div className="border-t border-indigo-500 bg-indigo-600 px-4 py-3 sm:hidden">
          {token && user ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-indigo-500"
              >
                <User size={16} /> Profile
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-indigo-500"
              >
                Orders
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-indigo-500"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-indigo-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
