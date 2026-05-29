import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import {
  getAdminCustomer,
  setCustomerBlocked,
  type AdminCustomer,
} from '../../api/adminUsers';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { useTenantPath } from '../../hooks/useTenantNavigate';

export function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);
  const tenantPath = useTenantPath();
  const { showToast } = useToast();

  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    if (!customerId || Number.isNaN(customerId)) return;
    setLoading(true);
    setError('');
    try {
      setCustomer(await getAdminCustomer(customerId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load customer.'));
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggleBlock = async () => {
    if (!customer) return;
    setToggling(true);
    try {
      const updated = await setCustomerBlocked(customer.id, !customer.isBlocked);
      setCustomer(updated);
      showToast(
        'success',
        updated.isBlocked ? 'Customer blocked.' : 'Customer unblocked.',
      );
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Failed to update customer.'));
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link
          to={tenantPath('/admin/customers')}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to customers
        </Link>
        <p className="text-sm text-red-600">{error || 'Customer not found.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={tenantPath('/admin/customers')}
        className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to customers
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{customer.email}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Role</dt>
                <dd className="font-medium text-gray-900">{customer.role}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Orders placed</dt>
                <dd className="font-medium text-gray-900">{customer.orderCount}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Joined</dt>
                <dd className="font-medium text-gray-900">
                  {customer.createdAt
                    ? new Date(customer.createdAt).toLocaleString()
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Account status</dt>
                <dd className="font-medium">
                  {customer.isBlocked ? (
                    <span className="text-red-600">Blocked</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Block login</span>
            <input
              type="checkbox"
              role="switch"
              checked={customer.isBlocked}
              disabled={toggling || customer.role === 'ADMIN'}
              onChange={() => void handleToggleBlock()}
              className="size-5 rounded accent-red-600"
            />
          </label>
        </div>
        {customer.role === 'ADMIN' && (
          <p className="mt-4 text-sm text-amber-700">
            Admin accounts cannot be blocked from this screen.
          </p>
        )}
      </div>
    </div>
  );
}
