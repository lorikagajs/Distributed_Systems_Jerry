import { Link } from 'react-router-dom';

interface StoreNotFoundProps {
  slug: string;
  message?: string | null;
}

export function StoreNotFound({ slug, message }: StoreNotFoundProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Store not found</h1>
      <p className="mt-2 max-w-md text-gray-600">
        {message ?? `We couldn't find a store at "${slug}".`}
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Browse all stores
      </Link>
    </div>
  );
}
