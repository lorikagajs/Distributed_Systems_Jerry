import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import {
  createProduct,
  updateProduct,
  uploadProductImages,
  type CreateProductPayload,
} from '../../api/products';
import { productFormSchema } from '../../schemas/adminSchemas';
import type { Category, Product } from '../../types';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (product: Product) => void;
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  categoryId: '',
  imageUrl: '',
};

export function ProductFormModal({
  open,
  product,
  categories,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const titleId = useId();
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  /** Set when create succeeded but image upload failed — avoids duplicate products on retry. */
  const pendingProductIdRef = useRef<number | null>(null);

  const isEdit = product != null;

  useEffect(() => {
    if (!open) return;

    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? '',
        price: String(product.price),
        compareAtPrice:
          product.compareAtPrice != null ? String(product.compareAtPrice) : '',
        stock: String(product.stock),
        categoryId: String(product.categoryId),
        imageUrl: product.imageUrl ?? '',
      });
    } else {
      setForm({
        ...emptyForm,
        categoryId: categories[0] ? String(categories[0].id) : '',
      });
    }
    setImageFiles([]);
    setError('');
    pendingProductIdRef.current = null;
  }, [open, product, categories]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, saving, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;

    setError('');

    const parsed = productFormSchema.safeParse({
      ...form,
      imageUrl: form.imageUrl.trim() || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }

    const payload: CreateProductPayload = {
      name: parsed.data.name,
      description: parsed.data.description?.trim() || undefined,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice,
      stock: parsed.data.stock,
      categoryId: parsed.data.categoryId,
      imageUrl: parsed.data.imageUrl,
    };

    submittingRef.current = true;
    setSaving(true);
    try {
      const existingId = isEdit
        ? product.id
        : pendingProductIdRef.current ?? undefined;

      let saved =
        existingId != null
          ? await updateProduct(existingId, payload)
          : await createProduct(payload);

      if (!isEdit && existingId == null) {
        pendingProductIdRef.current = saved.id;
      }

      if (imageFiles.length > 0) {
        try {
          saved = await uploadProductImages(saved.id, imageFiles);
        } catch (uploadErr) {
          setError(
            `${getApiErrorMessage(uploadErr, 'Image upload failed.')}` +
              ' The product was saved; fix the images and click Create again to retry upload.',
          );
          onSaved(saved);
          return;
        }
      }

      pendingProductIdRef.current = null;
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save product.'));
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={saving ? undefined : onClose}
        disabled={saving}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <h2 id={titleId} className="pr-8 text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit product' : 'Add product'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="product-description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Supports plain text or markdown"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">
                Price (€)
              </label>
              <input
                id="product-price"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
            <div>
              <label
                htmlFor="product-compare-price"
                className="block text-sm font-medium text-gray-700"
              >
                Compare-at (€)
              </label>
              <input
                id="product-compare-price"
                type="number"
                min={0}
                step="0.01"
                value={form.compareAtPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, compareAtPrice: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700">
              Stock
            </label>
            <input
              id="product-stock"
              type="number"
              min={0}
              step={1}
              required
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="product-category"
              required
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {categories.length === 0 && (
                <option value="">No categories available</option>
              )}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-image-url" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              id="product-image-url"
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div>
            <label htmlFor="product-image-file" className="block text-sm font-medium text-gray-700">
              Upload images
            </label>
            <input
              id="product-image-file"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setImageFiles(Array.from(e.target.files ?? []))
              }
              className="mt-1 w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {isEdit ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
