import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
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
import { createOrder } from '../api/orders';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useTenantNavigate, useTenantPath } from '../hooks/useTenantNavigate';
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

export function CartPage() {
  const { token } = useAuth();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const tenantPath = useTenantPath();
  const tenantNavigate = useTenantNavigate();
  const { showToast } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      showToast('error', 'Failed to load your cart.');
      setCart({ id: 0, items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (token) {
      void loadCart();
    }
  }, [token, loadCart]);

  const subtotal = useMemo(
    () => (cart ? getSubtotal(cart.items) : 0),
    [cart],
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const orderTotal = subtotal + shipping;

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
    } catch {
      setCart(previous);
      showToast('error', 'Could not update quantity.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
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
      showToast('success', 'Item removed from cart');
    } catch {
      setCart(previous);
      showToast('error', 'Could not remove item.');
    }
  };

  const handleClearCart = async () => {
    if (!cart || cart.items.length === 0) return;

    const previous = cart;
    setClearing(true);
    setCart({ ...cart, items: [], total: 0 });

    try {
      const updated = await clearCart();
      setCart(updated);
      showToast('success', 'Cart cleared');
    } catch {
      setCart(previous);
      showToast('error', 'Could not clear cart.');
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    setCheckingOut(true);
    try {
      const items = cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
      await createOrder(items);
      setCart({ id: cart.id, items: [], total: 0 });
      showToast('success', 'Order placed successfully!');
      tenantNavigate('/orders');
    } catch {
      showToast('error', 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (!token) {
    return <Navigate to={`/${tenantSlug}/login`} replace />;
  }

  if (loading) {
    return <LoadingSpinner label="Loading cart" />;
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <ShoppingBag className="size-12" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-sm text-gray-600">
          Looks like you haven&apos;t added anything yet. Explore our products
          and find something you love.
        </p>
        <Link
          to={tenantPath('/products')}
          className="mt-8 rounded-lg bg-[var(--color-primary)] px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
      <p className="mt-1 text-sm text-gray-600">
        {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
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
                    className="size-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
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

                  <div className="min-w-0 flex-1">
                    <Link
                      to={tenantPath(`/products/${item.product.id}`)}
                      className="font-medium text-gray-900 hover:text-[var(--color-primary)]"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatPrice(item.price)} each
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <div className="flex items-center rounded-lg border border-gray-300">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={
                            isUpdating || item.quantity <= 1
                          }
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
                    onClick={() => handleRemove(item.id)}
                    className="self-start rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 sm:self-center"
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
            onClick={handleClearCart}
            disabled={clearing}
            className="mt-4 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
          >
            {clearing ? 'Clearing…' : 'Clear Cart'}
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for
                  free shipping
                </p>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
                <dt className="font-semibold text-gray-900">Total</dt>
                <dd className="font-bold text-gray-900">
                  {formatPrice(orderTotal)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {checkingOut && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              Proceed to Checkout
            </button>

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
  );
}
