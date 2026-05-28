import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  getCategories,
  getProducts,
  PRODUCTS_PAGE_SIZE,
  type ProductSort,
} from '../api/products';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFiltersPanel } from '../components/products/ProductFiltersPanel';
import { ProductCardSkeleton } from '../components/ui/ProductCardSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Package } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { Category, Product } from '../types';

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

function parseCategoryIds(params: URLSearchParams): number[] {
  return params
    .getAll('categoryId')
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id) && id > 0);
}

function parseNumberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

export function ProductsPage() {
  const { tenant } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') ?? '';
  const selectedCategoryIds = parseCategoryIds(searchParams);
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const minRating = parseNumberParam(searchParams.get('minRating')) ?? null;
  const sort = (searchParams.get('sort') as ProductSort) || 'newest';
  const page = Math.max(1, parseNumberParam(searchParams.get('page')) ?? 1);

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === undefined || value === '') {
            next.delete(key);
          } else if (Array.isArray(value)) {
            next.delete(key);
            value.forEach((v) => next.append(key, v));
          } else {
            next.set(key, value);
          }
        }

        if (!('page' in updates) && Object.keys(updates).length > 0) {
          next.set('page', '1');
        }

        return next;
      });
    },
    [setSearchParams],
  );

  const handleCategoryToggle = (categoryId: number, checked: boolean) => {
    const next = checked
      ? [...selectedCategoryIds, categoryId]
      : selectedCategoryIds.filter((id) => id !== categoryId);
    updateParams({
      categoryId: next.length ? next.map(String) : null,
    });
  };

  const handleClearFilters = () => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    setSearchParams(next);
    setFiltersOpen(false);
  };

  useEffect(() => {
    if (!tenant?.tenantId) return;
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, [tenant?.tenantId]);

  // Legacy navbar links used ?category=Name — map to categoryId once categories load
  useEffect(() => {
    const legacyCategory = searchParams.get('category');
    if (!legacyCategory || categories.length === 0) return;
    if (searchParams.getAll('categoryId').length > 0) return;

    const match = categories.find(
      (c) => c.name.toLowerCase() === legacyCategory.toLowerCase(),
    );
    if (!match) return;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('category');
      next.append('categoryId', String(match.id));
      next.set('page', '1');
      return next;
    });
  }, [categories, searchParams, setSearchParams]);

  useEffect(() => {
    if (!tenant?.tenantId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const result = await getProducts({
          search: search || undefined,
          categoryId:
            selectedCategoryIds.length > 0
              ? selectedCategoryIds
              : undefined,
          minPrice: parseNumberParam(minPrice || null),
          maxPrice: parseNumberParam(maxPrice || null),
          minRating: minRating ?? undefined,
          sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : 'newest',
          page,
          limit: PRODUCTS_PAGE_SIZE,
        });

        if (cancelled) return;

        setProducts(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch {
        if (!cancelled) {
          setError('Failed to load products. Please try again.');
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    tenant?.tenantId,
    search,
    selectedCategoryIds.join(','),
    minPrice,
    maxPrice,
    minRating,
    sort,
    page,
  ]);

  const filterPanelProps = {
    categories,
    selectedCategoryIds,
    minPrice,
    maxPrice,
    minRating,
    onCategoryToggle: handleCategoryToggle,
    onMinPriceChange: (value: string) => updateParams({ minPrice: value || null }),
    onMaxPriceChange: (value: string) => updateParams({ maxPrice: value || null }),
    onMinRatingChange: (value: number | null) =>
      updateParams({ minRating: value != null ? String(value) : null }),
    onClearFilters: handleClearFilters,
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= page - 1 && p <= page + 1),
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {search && (
            <p className="mt-1 text-sm text-gray-600">
              Results for &ldquo;{search}&rdquo;
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <ProductFiltersPanel {...filterPanelProps} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{total}</span>{' '}
              {total === 1 ? 'product' : 'products'} found
            </p>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              Sort by
              <select
                value={sort}
                onChange={(e) =>
                  updateParams({ sort: e.target.value as ProductSort })
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {loading ? (
            <ul
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
              aria-busy="true"
              aria-label="Loading products"
            >
              {Array.from({ length: PRODUCTS_PAGE_SIZE }, (_, i) => (
                <li key={i}>
                  <ProductCardSkeleton />
                </li>
              ))}
            </ul>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try adjusting your filters or search terms to find what you're looking for."
              action={{
                type: 'button',
                label: 'Clear filters',
                onClick: handleClearFilters,
              }}
              compact
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}

          {!loading && totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              aria-label="Pagination"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {pageNumbers.map((p, index) => {
                const prev = pageNumbers[index - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;

                return (
                  <span key={p} className="flex items-center gap-2">
                    {showEllipsis && (
                      <span className="px-1 text-gray-400">…</span>
                    )}
                    <button
                      type="button"
                      onClick={() => updateParams({ page: String(p) })}
                      className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'border border-gray-300 text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ProductFiltersPanel {...filterPanelProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
