import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import { getProducts, getCategories } from '../api/products';
import type { Product, Category } from '../types';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newest, setNewest] = useState<Product[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewest, setLoadingNewest] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoadingCats(false));

    getProducts({ limit: 8 })
      .then(setFeatured)
      .catch(console.error)
      .finally(() => setLoadingFeatured(false));

    getProducts({ limit: 4 })
      .then(setNewest)
      .catch(console.error)
      .finally(() => setLoadingNewest(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* -- Hero Banner -- */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Shop the Best Products
          </h1>
          <p className="mb-8 text-lg text-indigo-100 sm:text-xl">
            Discover thousands of products across hundreds of categories — delivered fast, priced right.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50"
          >
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">

        {/* -- Categories -- */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              All categories <ArrowRight size={14} />
            </Link>
          </div>
          {loadingCats ? (
            <LoadingSpinner />
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories found.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={'/products?categoryId=' + cat.id}
                  className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-indigo-200 w-28"
                >
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                      <Tag size={22} className="text-indigo-500" />
                    </div>
                  )}
                  <span className="text-center text-xs font-medium text-gray-700 line-clamp-2">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* -- Featured Products -- */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loadingFeatured ? (
            <LoadingSpinner size="lg" />
          ) : featured.length === 0 ? (
            <p className="text-sm text-gray-400">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* -- New Arrivals -- */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loadingNewest ? (
            <LoadingSpinner size="lg" />
          ) : newest.length === 0 ? (
            <p className="text-sm text-gray-400">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newest.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
