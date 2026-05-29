import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { FolderTree, Plus, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import { createCategory, deleteCategory } from '../../api/categories';
import { getCategories } from '../../api/products';
import { AdminTableSkeleton } from '../../components/admin/AdminTableSkeleton';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { categoryFormSchema } from '../../schemas/adminSchemas';
import type { Category } from '../../types';

export function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await getCategories());
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Failed to load categories.'));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsed = categoryFormSchema.safeParse({ name });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setSaving(true);
    try {
      const created = await createCategory(parsed.data.name);
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName('');
      showToast('success', 'Category created.');
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to create category.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('success', 'Category deleted.');
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Failed to delete category.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <p className="mt-1 text-sm text-gray-600">
          Organize products. Categories with assigned products cannot be deleted.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
            New category name
          </label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          {formError && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden />
          Add category
        </button>
      </form>

      {loading ? (
        <AdminTableSkeleton cols={2} rows={4} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories"
          description="Create a category to assign products."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cat)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget != null}
        title="Delete category"
        message={`Delete "${deleteTarget?.name}"? This fails if products are still assigned.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
