import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../api/auth';
import {
  changePassword,
  deleteAccount,
  getMyProfile,
  getMyReviews,
  updateProfile,
} from '../api/users';
import { OrderList } from '../components/orders/OrderList';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StarRating } from '../components/ui/StarRating';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTenantNavigate, useTenantPath } from '../hooks/useTenantNavigate';
import type { Review, UserProfile } from '../types';

const TABS = [
  { id: 'profile', label: 'My Profile' },
  { id: 'orders', label: 'My Orders' },
  { id: 'reviews', label: 'My Reviews' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function formatReviewDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Alert({
  type,
  message,
}: {
  type: 'success' | 'error';
  message: string;
}) {
  const styles =
    type === 'success'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-red-200 bg-red-50 text-red-700';

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      {message}
    </div>
  );
}

export function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { clearCartContext } = useCart();
  const tenantPath = useTenantPath();
  const tenantNavigate = useTenantNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [name, setName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
      setName(data.name);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [setUser]);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError('');
    try {
      const data = await getMyReviews();
      setReviews(data);
    } catch {
      setReviews([]);
      setReviewsError('Failed to load your reviews.');
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      void loadReviews();
    }
  }, [activeTab, loadReviews]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileSaving(true);

    try {
      const updated = await updateProfile(name.trim());
      setProfile(updated);
      setName(updated.name);
      setUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: getApiErrorMessage(err, 'Could not update profile.'),
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'New password and confirmation do not match.',
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be at least 8 characters.',
      });
      return;
    }

    setPasswordSaving(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({
        type: 'success',
        text: 'Password changed successfully.',
      });
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: getApiErrorMessage(err, 'Could not change password.'),
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError('');
    try {
      await deleteAccount();
      clearCartContext();
      logout();
      tenantNavigate('/');
    } catch (err) {
      setDeleteError(
        getApiErrorMessage(err, 'Could not delete your account.'),
      );
    } finally {
      setDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  const displayName = profile?.name ?? user?.name ?? '—';
  const displayEmail = profile?.email ?? user?.email ?? '—';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Account</h1>
      <p className="mt-1 text-gray-600">Manage your profile, orders, and reviews.</p>

      <div className="mt-8 border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Profile tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {profileLoading ? (
              <LoadingSpinner label="Loading profile" />
            ) : (
              <>
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Account information
                  </h2>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-gray-500">Name</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">
                        {displayName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Email</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">
                        {displayEmail}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Edit profile
                  </h2>
                  <form
                    onSubmit={handleProfileSubmit}
                    className="mt-4 max-w-md space-y-4"
                  >
                    {profileMessage && (
                      <Alert
                        type={profileMessage.type}
                        message={profileMessage.text}
                      />
                    )}
                    <div>
                      <label
                        htmlFor="profile-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={profileSaving || !name.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {profileSaving && (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      )}
                      Save changes
                    </button>
                  </form>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Change password
                  </h2>
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="mt-4 max-w-md space-y-4"
                  >
                    {passwordMessage && (
                      <Alert
                        type={passwordMessage.type}
                        message={passwordMessage.text}
                      />
                    )}
                    <div>
                      <label
                        htmlFor="current-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Current password
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        New password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm new password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {passwordSaving && (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      )}
                      Update password
                    </button>
                  </form>
                </section>

                <section className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-red-900">
                    Delete account
                  </h2>
                  <p className="mt-2 text-sm text-red-800/90">
                    Permanently remove your account and personal data. This
                    action cannot be undone. Accounts with existing orders
                    cannot be deleted.
                  </p>
                  {deleteError && (
                    <p className="mt-3 text-sm text-red-700" role="alert">
                      {deleteError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Delete my account
                  </button>
                </section>
              </>
            )}
          </div>
        )}

        {activeTab === 'orders' && <OrderList variant="embedded" />}

        {activeTab === 'reviews' && (
          <div>
            {reviewsLoading ? (
              <LoadingSpinner label="Loading reviews" />
            ) : reviewsError ? (
              <p className="text-sm text-red-600" role="alert">
                {reviewsError}
              </p>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No reviews yet"
                description="You haven't written any reviews yet. Share your thoughts on products you've purchased."
                action={{
                  type: 'link',
                  label: 'Browse products',
                  to: tenantPath('/products'),
                }}
                compact
              />
            ) : (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link
                          to={tenantPath(`/products/${review.productId}`)}
                          className="font-medium text-gray-900 hover:text-[var(--color-primary)]"
                        >
                          {review.product?.name ?? `Product #${review.productId}`}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatReviewDate(review.createdAt)}
                        </p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm text-gray-600">{review.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete your account?"
        message="This will permanently delete your profile, cart, and reviews. You will be logged out immediately."
        confirmLabel="Delete account"
        variant="danger"
        loading={deletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
