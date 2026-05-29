import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ImageOff, Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../api/auth';
import { addToCart } from '../api/cart';
import { getWishlist, removeFromWishlist } from '../api/wishlist';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { useTenantPath } from '../hooks/useTenantNavigate';
import type { Wishlist, WishlistItem } from '../types';

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

export function WishlistPage() {
  const tenantPath = useTenantPath();
  const { showToast } = useToast();
  const { syncCartCount } = useCart();

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState<WishlistItem | null>(null);
  const [removing, setRemoving] = useState(false);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      setWishlist(await getWishlist());
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Failed to load wishlist.'));
      setWishlist({ id: 0, items: [] });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const updated = await removeFromWishlist(removeTarget.productId);
      setWishlist(updated);
      setRemoveTarget(null);
      showToast('success', 'Removed from wishlist.');
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Could not remove item.'));
    } finally {
      setRemoving(false);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (item.product.stock <= 0) {
      showToast('error', 'This product is out of stock.');
      return;
    }

    setAddingProductId(item.productId);
    try {
      const cart = await addToCart(item.productId, 1);
      syncCartCount(cart);
      showToast('success', 'Added to cart.');
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Could not add to cart.'));
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading wishlist" />;
  }

  const items = wishlist?.items ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My wishlist</h1>
        <p className="mt-1 text-sm text-gray-600">
          Products you saved for later ({items.length} item
          {items.length !== 1 ? 's' : ''}).
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you love from the product page."
          action={{
            type: 'link',
            label: 'Browse products',
            to: tenantPath('/products'),
          }}
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const imageUrl =
              item.product.imageUrl ?? item.product.images[0] ?? null;
            const inStock = item.product.stock > 0;

            return (
              <li
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <Link
                  to={tenantPath(`/products/${item.product.id}`)}
                  className="flex shrink-0 items-center gap-4 sm:flex-1"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="size-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <ImageOff className="size-8" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 hover:text-[var(--color-primary)]">
                      {item.product.name}
                    </p>
                    {item.product.category && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {item.product.category.name}
                      </p>
                    )}
                    <p className="mt-2 text-lg font-bold text-gray-900">
                      {formatPrice(item.product.price)}
                    </p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        inStock ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {inStock ? 'In stock' : 'Out of stock'}
                    </p>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleAddToCart(item)}
                    disabled={!inStock || addingProductId === item.productId}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingProductId === item.productId ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <ShoppingCart className="size-4" aria-hidden />
                    )}
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(item)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmModal
        open={removeTarget != null}
        title="Remove from wishlist"
        message={`Remove "${removeTarget?.product.name}" from your wishlist?`}
        confirmLabel="Remove"
        variant="danger"
        loading={removing}
        onConfirm={handleConfirmRemove}
        onCancel={() => !removing && setRemoveTarget(null)}
      />
    </div>
  );
}
