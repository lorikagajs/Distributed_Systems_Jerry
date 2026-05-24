import { useCallback, useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { getMyOrders } from '../../api/orders';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { useTenantPath } from '../../hooks/useTenantNavigate';
import type { Order } from '../../types';
import {
  formatOrderDate,
  formatOrderPrice,
  getOrderGrandTotal,
  getOrderItemCount,
  shortenOrderId,
} from '../../utils/orders';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Link } from 'react-router-dom';

interface OrderListProps {
  variant?: 'page' | 'embedded';
}

export function OrderList({ variant = 'page' }: OrderListProps) {
  const { token } = useAuth();
  const tenantPath = useTenantPath();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch {
      showToast('error', 'Failed to load your orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (token) {
      void loadOrders();
    }
  }, [token, loadOrders]);

  if (loading) {
    return <LoadingSpinner label="Loading orders" />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description={
          variant === 'embedded'
            ? 'When you place an order, it will show up here.'
            : 'When you place an order, it will show up here.'
        }
        action={{
          type: 'link',
          label: variant === 'embedded' ? 'Shop now' : 'Shop Now',
          to: tenantPath('/products'),
        }}
        compact={variant === 'embedded'}
      />
    );
  }

  return (
    <ul className={variant === 'page' ? 'mt-8 space-y-4' : 'space-y-4'}>
      {orders.map((order) => {
        const itemCount = getOrderItemCount(order.items);
        const grandTotal = getOrderGrandTotal(order.items);

        return (
          <li
            key={order.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {shortenOrderId(order.id)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm text-gray-500">
                  {formatOrderDate(order.createdAt)}
                </p>
                <p className="text-sm text-gray-600">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
                  <span className="font-medium text-gray-900">
                    {formatOrderPrice(grandTotal)}
                  </span>
                </p>
              </div>

              <Link
                to={tenantPath(`/orders/${order.id}`)}
                className="inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
              >
                View Details
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
