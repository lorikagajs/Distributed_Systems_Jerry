import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import { getAdminOrders } from '../../api/adminOrders';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminTableSkeleton } from '../../components/admin/AdminTableSkeleton';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTenantPath } from '../../hooks/useTenantNavigate';
import type { Order } from '../../types';

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AdminOrdersPage() {
  const tenantPath = useTenantPath();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await getAdminOrders());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load orders.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Orders</h2>
        <p className="mt-1 text-sm text-gray-600">Review and fulfill customer orders.</p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <AdminTableSkeleton cols={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Orders will appear here when customers checkout."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <Link
                        to={tenantPath(`/admin/orders/${order.id}`)}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {order.customer?.name ?? order.customer?.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      €{order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
