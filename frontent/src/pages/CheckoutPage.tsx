import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { getApiErrorMessage } from '../api/auth';
import { getCart } from '../api/cart';
import { createOrder } from '../api/orders';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { useTenantNavigate, useTenantPath } from '../hooks/useTenantNavigate';
import type { Cart, CartItem, PaymentMethod, ShippingAddress } from '../types';
import { PAYMENT_METHODS, requiresCardDetails } from '../utils/payment';

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;

function formatPrice(amount: number) {
  return `€${amount.toFixed(2)}`;
}

function getSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

const emptyShipping: ShippingAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

export function CheckoutPage() {
  const tenantPath = useTenantPath();
  const tenantNavigate = useTenantNavigate();
  const { showToast } = useToast();
  const { syncCartCount, clearCartContext } = useCart();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [shipping, setShipping] = useState<ShippingAddress>(emptyShipping);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
      syncCartCount(data);
    } catch {
      showToast('error', 'Failed to load your cart.');
      setCart({ id: 0, items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [showToast, syncCartCount]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const subtotal = useMemo(() => (cart ? getSubtotal(cart.items) : 0), [cart]);
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const orderTotal = subtotal + shippingCost;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    setError('');

    if (!shipping.line1.trim() || !shipping.city.trim() || !shipping.postalCode.trim() || !shipping.country.trim()) {
      setError('Please complete your shipping address.');
      return;
    }

    if (requiresCardDetails(paymentMethod)) {
      const digits = cardNumber.replace(/\s/g, '');
      if (digits.length < 15 || !cardExpiry.trim() || !cardCvc.trim() || !cardName.trim()) {
        setError('Please complete your card details.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shipping: {
          line1: shipping.line1.trim(),
          line2: shipping.line2?.trim() || undefined,
          city: shipping.city.trim(),
          state: shipping.state?.trim() || undefined,
          postalCode: shipping.postalCode.trim(),
          country: shipping.country.trim(),
        },
        payment: {
          method: paymentMethod,
          cardLast4: requiresCardDetails(paymentMethod)
            ? cardNumber.replace(/\s/g, '').slice(-4)
            : undefined,
        },
      });

      clearCartContext();
      showToast('success', 'Payment successful — your order is confirmed!');
      tenantNavigate(`/orders/${order.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Checkout failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading checkout" />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Nothing to checkout</h1>
        <p className="mt-2 text-gray-600">Your cart is empty.</p>
        <Link
          to={tenantPath('/products')}
          className="mt-6 inline-flex rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="mt-1 text-sm text-gray-600">
        Enter shipping and payment details to complete your order.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="size-5 text-gray-500" aria-hidden />
              Shipping address
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="line1" className="block text-sm font-medium text-gray-700">
                  Address line 1
                </label>
                <input
                  id="line1"
                  required
                  value={shipping.line1}
                  onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="line2" className="block text-sm font-medium text-gray-700">
                  Address line 2 (optional)
                </label>
                <input
                  id="line2"
                  value={shipping.line2 ?? ''}
                  onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  required
                  value={shipping.city}
                  onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State / Region
                </label>
                <input
                  id="state"
                  value={shipping.state ?? ''}
                  onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal code
                </label>
                <input
                  id="postalCode"
                  required
                  value={shipping.postalCode}
                  onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  id="country"
                  required
                  value={shipping.country}
                  onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <CreditCard className="size-5 text-gray-500" aria-hidden />
              Payment
            </h2>

            <div className="mt-4 space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === method.value
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      {method.label}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {method.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {requiresCardDetails(paymentMethod) && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                    Name on card
                  </label>
                  <input
                    id="cardName"
                    autoComplete="cc-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Card number
                  </label>
                  <input
                    id="cardNumber"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
                <div>
                  <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                    Expiry
                  </label>
                  <input
                    id="cardExpiry"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
                <div>
                  <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700">
                    CVC
                  </label>
                  <input
                    id="cardCvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>
            )}

            <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="size-4 shrink-0" aria-hidden />
              Demo checkout — no real charges. Card numbers are not stored.
            </p>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm text-gray-600">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span className="line-clamp-1">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <dt>Subtotal</dt>
                <dd className="font-medium text-gray-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-gray-600">
                <dt>Shipping</dt>
                <dd className="font-medium text-gray-900">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                <dt className="font-semibold text-gray-900">Total</dt>
                <dd className="font-bold text-gray-900">{formatPrice(orderTotal)}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Pay {formatPrice(orderTotal)}
            </button>

            <Link
              to={tenantPath('/cart')}
              className="mt-4 block text-center text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
