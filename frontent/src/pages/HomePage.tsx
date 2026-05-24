import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { getCategories, getProducts } from '../api/products';
import { useTenant } from '../context/TenantContext';
import { useTenantPath } from '../hooks/useTenantNavigate';
import { ProductCard } from '../components/products/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Category, Product } from '../types';

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">No products available.</p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function HomePage() {
  const { tenant } = useTenant();
  const tenantPath = useTenantPath();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tenant?.tenantId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [categoriesRes, productsRes] = await Promise.all([
          getCategories(),
          getProducts({ limit: 100 }),
        ]);

        if (cancelled) return;

        setCategories(categoriesRes);
        setFeatured(productsRes.data.slice(0, 8));
        setNewArrivals(
          [...productsRes.data].sort((a, b) => b.id - a.id).slice(0, 4),
        );
      } catch {
        if (!cancelled) {
          setError('Failed to load store content. Please try again later.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [tenant?.tenantId]);

  if (loading) {
    return <LoadingSpinner label="Loading homepage" />;
  }

  return (
    <div className="-mx-4 -mt-8 sm:-mx-6 lg:-mx-8">
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Shop the Best Products
          </h1>
          <p className="mt-4 text-lg text-indigo-100 sm:text-xl">
            Discover curated collections, exclusive deals, and new arrivals from{' '}
            {tenant?.storeName ?? 'our store'}.
          </p>
          <Link
            to={tenantPath('/products')}
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-indigo-600 shadow-md transition-transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section aria-labelledby="categories-heading">
          <h2
            id="categories-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Shop by Category
          </h2>
          {categories.length === 0 ? (
            <p className="mt-6 text-gray-500">No categories available.</p>
          ) : (
            <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <li key={category.id} className="shrink-0">
                  <Link
                    to={`${tenantPath('/products')}?categoryId=${category.id}`}
                    className="flex w-36 flex-col items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:w-40"
                  >
                    <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <FolderOpen
                          className="size-10 text-gray-400"
                          aria-hidden
                        />
                      )}
                    </div>
                    <span className="mt-3 text-center text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="featured-heading">
          <div className="flex items-end justify-between gap-4">
            <h2
              id="featured-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Featured Products
            </h2>
            <Link
              to={tenantPath('/products')}
              className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
            >
              View all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={featured} />
          </div>
        </section>

        <section aria-labelledby="new-arrivals-heading">
          <div className="flex items-end justify-between gap-4">
            <h2
              id="new-arrivals-heading"
              className="text-2xl font-bold text-gray-900"
            >
              New Arrivals
            </h2>
            <Link
              to={tenantPath('/products')}
              className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
            >
              View all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      </div>
    </div>
  );
}
