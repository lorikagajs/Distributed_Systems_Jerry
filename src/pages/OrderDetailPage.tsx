import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, ImageOff, MapPin } from 'lucide-react';
import { getOrderById } from '../api/orders';
import { OrderProgressTracker } from '../components/orders/OrderProgressTracker';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useTenantPath } from '../hooks/useTenantNavigate';
import type { Order, ShippingAddress } from '../types';
import {
  formatOrderDate,
  formatOrderPrice,
  getOrderShipping,
  getOrderSubtotal,
  shortenOrderId,
} from '../utils/orders';
import { getPaymentMethodLabel } from '../utils/payment';

function formatAddress(address: ShippingAddress) {
  const lines = [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(', '),
    [address.postalCode, address.country].filter(Boolean).join(' '),
  ].filter(Boolean);
  return lines;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const tenantPath = useTenantPath();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch {
      showToast('error', 'Could not load this order.');
      setOrder(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [orderId, showToast]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const subtotal = useMemo(
    () => (order ? getOrderSubtotal(order.items) : 0),
    [order],
  );
  const shipping = useMemo(() => getOrderShipping(subtotal), [subtotal]);
  const grandTotal = subtotal + shipping;

  if (loading) {
    return <LoadingSpinner label="Loading order" />;
  }

  if (notFound || !order) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <p className="mt-2 text-gray-600">
          This order does not exist or you do not have access to it.
        </p>
        <Link
          to={tenantPath('/orders')}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to orders
        </Link>
      </div>
    );
  }

  const addressLines = order.shippingAddress
    ? formatAddress(order.shippingAddress)
    : null;

  const payment = order.payments?.[0];

  return (
    <div className="space-y-8">
      <Link
        to={tenantPath('/orders')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to orders
      </Link>

      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {shortenOrderId(order.id)}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {formatOrderDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} className="self-start" />
        </div>

        <div className="mt-8">
          <OrderProgressTracker status={order.status} />
        </div>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-6 py-4 text-lg font-semibold text-gray-900">
          Items
        </h2>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 px-6 py-4 sm:items-center"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-gray-400">
                    <ImageOff className="size-8" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{item.product.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Qty {item.quantity} × {formatOrderPrice(item.price)}
                </p>
              </div>
              <p className="shrink-0 font-medium text-gray-900">
                {formatOrderPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {payment && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <CreditCard className="size-5 text-gray-500" aria-hidden />
              Payment
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Method</dt>
                <dd className="font-medium text-gray-900">
                  {getPaymentMethodLabel(payment.method)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-green-700">{payment.status}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Amount paid</dt>
                <dd className="font-medium text-gray-900">
                  {formatOrderPrice(payment.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Paid on</dt>
                <dd className="font-medium text-gray-900">
                  {formatOrderDate(payment.createdAt)}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <dt>Subtotal</dt>
              <dd className="font-medium text-gray-900">
                {formatOrderPrice(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>Shipping</dt>
              <dd className="font-medium text-gray-900">
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatOrderPrice(shipping)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
              <dt className="font-semibold text-gray-900">Total</dt>
              <dd className="font-bold text-gray-900">
                {formatOrderPrice(grandTotal)}
              </dd>
            </div>
          </dl>
        </section>

        {addressLines && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="size-5 text-gray-500" aria-hidden />
              Shipping address
            </h2>
            <address className="mt-4 space-y-1 text-sm not-italic text-gray-600">
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
          </section>
        )}
      </div>
    </div>
  );
}
