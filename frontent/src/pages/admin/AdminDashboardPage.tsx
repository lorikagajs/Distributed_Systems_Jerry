import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import {
  deleteProduct,
  getCategories,
  getProducts,
} from '../../api/products';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useTenant } from '../../context/TenantContext';
import { useTenantPath } from '../../hooks/useTenantNavigate';
import type { Category, Product } from '../../types';

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

export function AdminDashboardPage() {
  const { tenant } = useTenant();
  const tenantPath = useTenantPath();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!tenant?.tenantId) return;

    setLoading(true);
    setError('');
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        getCategories(),
        getProducts({ page: 1, limit: 100, sort: 'newest' }),
      ]);
      setCategories(categoriesRes);
      setProducts(productsRes.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load products.'));
    } finally {
      setLoading(false);
    }
  }, [tenant?.tenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSaved = (saved: Product) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === saved.id);
      if (index === -1) return [saved, ...prev];
      const next = [...prev];
      next[index] = saved;
      return next;
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete product.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage products for {tenant?.storeName ?? 'your store'}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden />
          Add product
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          No categories found. Create categories in the backend before adding products.
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
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start selling."
          action={{
            type: 'button',
            label: 'Add product',
            onClick: handleOpenCreate,
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
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
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={tenantPath(`/products/${product.id}`)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[var(--color-primary)]"
                          title="View on storefront"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                          <span className="sr-only">View on storefront</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[var(--color-primary)]"
                          title="Edit"
                        >
                          <Pencil className="size-4" aria-hidden />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="size-4" aria-hidden />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
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
