import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ImageOff,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from 'lucide-react';
import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../api/cart';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { useTenantPath } from '../hooks/useTenantNavigate';
import type { Cart, CartItem } from '../types';

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;

function formatPrice(amount: number) {
  return `€${amount.toFixed(2)}`;
}

function recalcCart(cart: Cart): Cart {
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return { ...cart, total };
}

function getSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

type ConfirmAction = 'clear' | 'remove';

export function CartPage() {
  const tenantPath = useTenantPath();
  const { showToast } = useToast();
  const { syncCartCount, clearCartContext } = useCart();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
      syncCartCount(data);
    } catch {
      showToast('error', 'Failed to load your cart.');
      setCart({ id: 0, items: [], total: 0 });
      clearCartContext();
    } finally {
      setLoading(false);
    }
  }, [showToast, syncCartCount, clearCartContext]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const subtotal = useMemo(
    () => (cart ? getSubtotal(cart.items) : 0),
    [cart],
  );
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const orderTotal = subtotal + shipping;

  const pendingRemoveItem = cart?.items.find((i) => i.id === pendingRemoveId);

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    if (!cart) return;

    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > item.product.stock) return;

    const previous = cart;
    setUpdatingItemId(item.id);
    setCart((c) => {
      if (!c) return c;
      const items = c.items.map((i) =>
        i.id === item.id ? { ...i, quantity: newQty } : i,
      );
      return recalcCart({ ...c, items });
    });

    try {
      const updated = await updateCartItem(item.id, newQty);
      setCart(updated);
      syncCartCount(updated);
    } catch {
      setCart(previous);
      showToast('error', 'Could not update quantity.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const executeRemove = async (itemId: number) => {
    if (!cart) return;

    const previous = cart;
    setCart((c) => {
      if (!c) return c;
      return recalcCart({
        ...c,
        items: c.items.filter((i) => i.id !== itemId),
      });
    });

    try {
      const updated = await removeCartItem(itemId);
      setCart(updated);
      syncCartCount(updated);
      showToast('success', 'Item removed from cart');
    } catch {
      setCart(previous);
      showToast('error', 'Could not remove item.');
    }
  };

  const executeClearCart = async () => {
    if (!cart || cart.items.length === 0) return;

    const previous = cart;
    setCart({ ...cart, items: [], total: 0 });

    try {
      const updated = await clearCart();
      setCart(updated);
      clearCartContext();
      showToast('success', 'Cart cleared');
    } catch {
      setCart(previous);
      syncCartCount(previous);
      showToast('error', 'Could not clear cart.');
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    setConfirmLoading(true);
    try {
      if (confirmAction === 'clear') {
        await executeClearCart();
      } else if (pendingRemoveId != null) {
        await executeRemove(pendingRemoveId);
      }
    } finally {
      setConfirmLoading(false);
      setConfirmAction(null);
      setPendingRemoveId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading cart" />;
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Explore our products and find something you love."
        action={{ type: 'link', label: 'Start Shopping', to: tenantPath('/products') }}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
      <p className="mt-1 text-sm text-gray-600">
        {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
      </p>

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
            {cart.items.map((item) => {
              const lineTotal = item.price * item.quantity;
              const isUpdating = updatingItemId === item.id;

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <Link
                    to={tenantPath(`/products/${item.product.id}`)}
                    className="mx-auto size-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:mx-0"
                  >
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <ImageOff className="size-8" />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <Link
                      to={tenantPath(`/products/${item.product.id}`)}
                      className="font-medium text-gray-900 hover:text-[var(--color-primary)]"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatPrice(item.price)} each
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                      <div className="flex items-center rounded-lg border border-gray-300">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="flex min-w-8 items-center justify-center gap-1 px-2 text-sm font-medium">
                          {isUpdating && (
                            <Loader2 className="size-3 animate-spin" />
                          )}
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, 1)}
                          disabled={
                            isUpdating ||
                            item.quantity >= item.product.stock
                          }
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        Subtotal: {formatPrice(lineTotal)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPendingRemoveId(item.id);
                      setConfirmAction('remove');
                    }}
                    className="self-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <X className="size-5" />
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setConfirmAction('clear')}
            className="mt-4 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
          >
            Clear Cart
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Shipping</dt>
                  <dd className="font-medium text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </dd>
                </div>
                {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-gray-500">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more
                    for free shipping
                  </p>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
                  <dt className="font-semibold text-gray-900">Total</dt>
                  <dd className="font-bold text-gray-900">
                    {formatPrice(orderTotal)}
                  </dd>
                </div>
              </dl>

              <Link
                to={tenantPath('/checkout')}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Proceed to Checkout
              </Link>

              <Link
                to={tenantPath('/products')}
                className="mt-4 block text-center text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmAction === 'clear'}
        title="Clear cart?"
        message="Remove all items from your cart. This cannot be undone."
        confirmLabel="Clear cart"
        variant="danger"
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={confirmAction === 'remove' && pendingRemoveId != null}
        title="Remove item?"
        message={
          pendingRemoveItem
            ? `Remove "${pendingRemoveItem.product.name}" from your cart?`
            : 'Remove this item from your cart?'
        }
        confirmLabel="Remove"
        variant="danger"
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmAction(null);
          setPendingRemoveId(null);
        }}
      />
    </div>
  );
}
