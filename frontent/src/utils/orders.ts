import type { OrderItem } from '../types';

export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 5.99;

export type OrderStatusKey =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export function normalizeOrderStatus(status: string): OrderStatusKey {
  const upper = status.toUpperCase();
  if (
    upper === 'PENDING' ||
    upper === 'CONFIRMED' ||
    upper === 'PROCESSING' ||
    upper === 'SHIPPED' ||
    upper === 'DELIVERED' ||
    upper === 'CANCELLED'
  ) {
    return upper;
  }
  return 'PENDING';
}

export function formatOrderPrice(amount: number) {
  return `€${amount.toFixed(2)}`;
}

export function shortenOrderId(id: number) {
  return `#${String(id).slice(-6).padStart(6, '0')}`;
}

export function formatOrderDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getOrderItemCount(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getOrderSubtotal(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getOrderShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
    ? 0
    : SHIPPING_COST;
}

export function getOrderGrandTotal(items: OrderItem[]) {
  const subtotal = getOrderSubtotal(items);
  return subtotal + getOrderShipping(subtotal);
}

export function getOrderStatusLabel(status: OrderStatusKey) {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PROCESSING':
      return 'Processing';
    case 'SHIPPED':
      return 'Shipped';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}
