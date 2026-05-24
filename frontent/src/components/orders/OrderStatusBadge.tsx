import {
  getOrderStatusLabel,
  normalizeOrderStatus,
  type OrderStatusKey,
} from '../../utils/orders';

const STATUS_STYLES: Record<OrderStatusKey, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  CONFIRMED: 'bg-sky-100 text-sky-800 ring-sky-600/20',
  PROCESSING: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  SHIPPED: 'bg-indigo-100 text-indigo-800 ring-indigo-600/20',
  DELIVERED: 'bg-green-100 text-green-800 ring-green-600/20',
  CANCELLED: 'bg-red-100 text-red-800 ring-red-600/20',
};

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const normalized = normalizeOrderStatus(status);
  const styles = STATUS_STYLES[normalized];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles} ${className}`}
    >
      {getOrderStatusLabel(normalized)}
    </span>
  );
}
