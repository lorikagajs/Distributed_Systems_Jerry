import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import {
  deleteProduct,
  getCategories,
  getProducts,
} from '../../api/products';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminTableSkeleton } from '../../components/admin/AdminTableSkeleton';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../context/TenantContext';
import { useTenantPath } from '../../hooks/useTenantNavigate';
import type { Category, Product } from '../../types';

const ADMIN_PAGE_SIZE = 10;

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

function stockLabel(stock: number) {
  if (stock <= 0) return { text: 'Out of stock', className: 'text-red-600' };
  if (stock < 10) return { text: 'Low stock', className: 'text-amber-600' };
  return { text: 'In stock', className: 'text-green-600' };
}

export function AdminProductsPage() {
  const { tenant } = useTenant();
  const tenantPath = useTenantPath();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const loadData = useCallback(async () => {
    if (!tenant?.tenantId) return;

    setLoading(true);
    setError('');
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        getCategories(),
        getProducts({
          page,
          limit: ADMIN_PAGE_SIZE,
          search: search || undefined,
          sort: 'newest',
        }),
      ]);
      setCategories(categoriesRes);
      setProducts(productsRes.data);
      setTotal(productsRes.total);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load products.'));
    } finally {
      setLoading(false);
    }
  }, [tenant?.tenantId, page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('success', 'Product deleted.');
      await loadData();
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Failed to delete product.'));
    } finally {
      setDeleting(false);
    }
  };

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage catalog for {tenant?.storeName ?? 'your store'}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setFormOpen(true);
          }}
          disabled={categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden />
          Add product
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      </form>

      {categories.length === 0 && !loading && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Create at least one category before adding products.
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

      {loading ? (
        <AdminTableSkeleton cols={6} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search ? 'No matching products' : 'No products yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Add your first product to start selling.'
          }
          action={
            !search
              ? {
                  type: 'button',
                  label: 'Add product',
                  onClick: () => {
                    setEditingProduct(null);
                    setFormOpen(true);
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Image</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const stock = stockLabel(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="size-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <Package className="size-5" aria-hidden />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.category?.name ??
                          categoryNames.get(product.categoryId) ??
                          '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className={stock.className}>{stock.text}</span>
                        <span className="ml-1 text-gray-500">({product.stock})</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={tenantPath(`/products/${product.id}`)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[var(--color-primary)]"
                            title="View on storefront"
                          >
                            <ExternalLink className="size-4" aria-hidden />
                            <span className="sr-only">View on storefront</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product);
                              setFormOpen(true);
                            }}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[var(--color-primary)]"
                            title="Edit"
                          >
                            <Pencil className="size-4" aria-hidden />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="size-4" aria-hidden />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSaved={(saved) => {
          showToast('success', editingProduct ? 'Product updated.' : 'Product created.');
          void loadData();
        }}
      />

      <ConfirmModal
        open={deleteTarget != null}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
