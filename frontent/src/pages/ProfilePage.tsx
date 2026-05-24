import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-2 text-gray-600">Your profile — coming soon.</p>
      {user && (
        <pre className="mt-4 overflow-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          {JSON.stringify(user, null, 2)}
        </pre>
      )}
    </div>
  );
}
