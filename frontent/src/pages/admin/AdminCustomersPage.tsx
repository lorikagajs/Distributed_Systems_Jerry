import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, X } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import {
  createCustomer,
  getAdminCustomers,
  type AdminCustomer,
} from '../../api/adminUsers';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminTableSkeleton } from '../../components/admin/AdminTableSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { useTenantPath } from '../../hooks/useTenantNavigate';
import { customerFormSchema } from '../../schemas/adminSchemas';

const PAGE_SIZE = 10;

export function AdminCustomersPage() {
  const tenantPath = useTenantPath();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCustomers(await getAdminCustomers());
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Failed to load customers.'));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const customersOnly = useMemo(
    () => customers.filter((c) => c.role === 'CUSTOMER'),
    [customers],
  );

  const totalPages = Math.max(1, Math.ceil(customersOnly.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return customersOnly.slice(start, start + PAGE_SIZE);
  }, [customersOnly, page]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const parsed = customerFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setSaving(true);
    try {
      const created = await createCustomer({
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      });
      setCustomers((prev) => [created, ...prev]);
      setModalOpen(false);
      setForm({ name: '', email: '', password: '' });
      showToast('success', 'Customer created.');
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to create customer.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customers</h2>
          <p className="mt-1 text-sm text-gray-600">
            View registered customers and manage access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Add customer
        </button>
      </div>

      {loading ? (
        <AdminTableSkeleton cols={5} />
      ) : customersOnly.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers"
          description="Customers appear after registration or manual creation."
          action={{
            type: 'button',
            label: 'Add customer',
            onClick: () => setModalOpen(true),
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Orders</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <Link
                      to={tenantPath(`/admin/customers/${customer.id}`)}
                      className="font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{customer.orderCount}</td>
                  <td className="px-4 py-3">
                    {customer.isBlocked ? (
                      <span className="text-red-600">Blocked</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={saving ? undefined : () => setModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => !saving && setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">Create customer</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              {formError && (
                <p className="text-sm text-red-600" role="alert">
                  {formError}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
