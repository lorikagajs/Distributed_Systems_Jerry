import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import {
  acceptOrder,
  getAdminOrderById,
  updateOrderStatus,
} from '../../api/adminOrders';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { useTenantPath } from '../../hooks/useTenantNavigate';
import { ORDER_STATUSES } from '../../schemas/adminSchemas';
import type { Order } from '../../types';

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const tenantPath = useTenantPath();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(async () => {
    if (!orderId || Number.isNaN(orderId)) return;
    setLoading(true);
    setError('');
    try {
      setOrder(await getAdminOrderById(orderId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load order.'));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (status: string) => {
    if (!order) return;
    setStatusSaving(true);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrder(updated);
      showToast('success', 'Order status updated.');
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Failed to update status.'));
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAccept = async () => {
    if (!order) return;
    setAccepting(true);
    try {
      const updated = await acceptOrder(order.id);
      setOrder(updated);
      showToast('success', 'Order accepted.');
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Failed to accept order.'));
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link
          to={tenantPath('/admin/orders')}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to orders
        </Link>
        <p className="text-sm text-red-600" role="alert">
          {error || 'Order not found.'}
        </p>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-6">
      <Link
        to={tenantPath('/admin/orders')}
        className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to orders
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
          <p className="mt-1 text-sm text-gray-600">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
          <div className="mt-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {order.status === 'PENDING' && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {accepting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CheckCircle className="size-4" aria-hidden />
              )}
              Accept order
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Status
            <select
              value={order.status}
              disabled={statusSaving}
              onChange={(e) => void handleStatusChange(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Customer</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">
                {order.customer?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{order.customer?.email ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Shipping address</h3>
          {order.shippingAddress ? (
            <address className="mt-3 not-italic text-sm text-gray-700">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              )}
              <br />
              {order.shippingAddress.city}
              {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
              <br />
              {order.shippingAddress.postalCode} {order.shippingAddress.country}
            </address>
          ) : (
            <p className="mt-3 text-sm text-gray-500">No address on file.</p>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <h3 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">
          Line items
        </h3>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Product</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Qty</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">Price</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {item.product.name}
                </td>
                <td className="px-5 py-3 text-gray-600">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-gray-600">
                  €{item.price.toFixed(2)}
                </td>
                <td className="px-5 py-3 text-right font-medium text-gray-900">
                  €{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-5 py-3 text-right text-gray-600">
                Subtotal
              </td>
              <td className="px-5 py-3 text-right font-medium text-gray-900">
                €{subtotal.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-5 py-3 text-right font-semibold text-gray-900">
                Total
              </td>
              <td className="px-5 py-3 text-right text-lg font-bold text-gray-900">
                €{order.total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
