// ─── Placeholder pages ───────────────────────────────────────────────────────
// Each page is a minimal placeholder. Replace the content with real
// implementations as the project grows.

import { Link, useParams } from "react-router-dom";

// Shared placeholder card
function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      {description && (
        <p className="max-w-md text-gray-500">{description}</p>
      )}
      <Link
        to="/"
        className="mt-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

export function HomePage() {
  return (
    <PlaceholderPage
      title="Welcome to ShopHub"
      description="Discover thousands of products across hundreds of categories."
    />
  );
}

export function ProductsPage() {
  return (
    <PlaceholderPage
      title="Products"
      description="Browse our full catalogue of products."
    />
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <PlaceholderPage
      title={`Product #${id}`}
      description="Product details will appear here."
    />
  );
}

export function CartPage() {
  return (
    <PlaceholderPage
      title="Your Cart"
      description="Review the items in your shopping cart."
    />
  );
}

export function LoginPage() {
  return (
    <PlaceholderPage
      title="Login"
      description="Sign in to your ShopHub account."
    />
  );
}

export function RegisterPage() {
  return (
    <PlaceholderPage
      title="Create Account"
      description="Join ShopHub and start shopping today."
    />
  );
}

export function ProfilePage() {
  return (
    <PlaceholderPage
      title="My Profile"
      description="Manage your account details."
    />
  );
}

export function OrdersPage() {
  return (
    <PlaceholderPage
      title="My Orders"
      description="View your order history and track shipments."
    />
  );
}
