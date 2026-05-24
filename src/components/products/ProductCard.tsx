import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, Loader2, ShoppingCart } from 'lucide-react';
import { getApiErrorMessage } from '../../api/auth';
import { addToCart } from '../../api/cart';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTenantPath, useTenantNavigate } from '../../hooks/useTenantNavigate';
import type { Product } from '../../types';
import { StarRating } from '../ui/StarRating';

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

export function ProductCard({ product }: ProductCardProps) {
  const { token } = useAuth();
  const { syncCartCount } = useCart();
  const { showToast } = useToast();
  const tenantPath = useTenantPath();
  const tenantNavigate = useTenantNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      tenantNavigate('/login', {
        state: { message: 'Please login to add items to your cart' },
      });
      return;
    }

    setAdding(true);
    try {
      const cart = await addToCart(product.id, 1);
      syncCartCount(cart);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Could not add to cart.'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        to={tenantPath(`/products/${product.id}`)}
        className="relative aspect-square overflow-hidden bg-gray-100"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <ImageOff className="size-12" aria-hidden />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={tenantPath(`/products/${product.id}`)}>
          <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-[var(--color-primary)]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-lg font-semibold text-gray-900">
          {formatPrice(product.price)}
        </p>

        <div className="mt-2">
          <StarRating rating={product.ratings} />
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || product.stock <= 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ShoppingCart className="size-4" aria-hidden />
          )}
          {product.stock <= 0
            ? 'Out of stock'
            : added
              ? 'Added!'
              : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
