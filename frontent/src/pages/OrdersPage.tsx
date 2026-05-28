import { OrderList } from '../components/orders/OrderList';

export function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
      <p className="mt-1 text-gray-600">
        Track and review your recent purchases.
      </p>
      <OrderList variant="page" />
    </div>
  );
}
