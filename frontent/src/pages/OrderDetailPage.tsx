import { useParams } from 'react-router-dom';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
      <p className="mt-2 text-gray-600">Order ID: {id}</p>
    </div>
  );
}
