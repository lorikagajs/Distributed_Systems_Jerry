import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addToCart } from '../../api/cart';
import StarRating from '../ui/StarRating';
import type { Product } from '../../types';
import { useState } from 'react';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={'/products/' + product.id} className="group flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative overflow-hidden rounded-t-xl bg-gray-50">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-indigo-50">
            <Package size={48} className="text-indigo-200" />
          </div>
        )}
        {product.stock === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">Out of stock</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-indigo-600">{product.name}</h3>
        <StarRating rating={product.ratings ?? 0} />
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-indigo-600">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <ShoppingCart size={14} />
            {adding ? '...' : added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
