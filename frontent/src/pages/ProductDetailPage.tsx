import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  ImageOff,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { addToCart } from '../api/cart';
import { getProductById, getProducts } from '../api/products';
import { addReview, getProductReviews } from '../api/reviews';
import { ProductCard } from '../components/products/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StarRating } from '../components/ui/StarRating';
import { StarRatingInput } from '../components/ui/StarRatingInput';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useTenantPath } from '../hooks/useTenantNavigate';
import type { Product, Review } from '../types';

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

function formatReviewDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { token } = useAuth();
  const tenantPath = useTenantPath();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const reviewsRef = useRef<HTMLElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  }, [product]);

  const averageRating = useMemo(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      return sum / reviews.length;
    }
    return product?.ratings ?? null;
  }, [reviews, product?.ratings]);

  useEffect(() => {
    if (!productId || Number.isNaN(productId)) {
      setError('Invalid product');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const prod = await getProductById(productId);
        if (cancelled) return;

        setProduct(prod);
        setSelectedImage(0);
        setQuantity(1);

        const [reviewsRes, relatedRes] = await Promise.all([
          getProductReviews(productId),
          getProducts({
            categoryId: [prod.categoryId],
            limit: 5,
          }),
        ]);

        if (cancelled) return;

        setReviews(reviewsRes);
        setRelated(
          relatedRes.data.filter((p) => p.id !== prod.id).slice(0, 4),
        );
      } catch {
        if (!cancelled) {
          setError('Product not found or failed to load.');
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    setQuantity((q) => {
      const next = q + delta;
      return Math.min(Math.max(1, next), product.stock);
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!token) {
      navigate(tenantPath('/login'), {
        state: { message: 'Please login to add to cart' },
      });
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      showToast('success', 'Added to cart successfully');
    } catch {
      showToast('error', 'Could not add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || !token) return;

    setSubmittingReview(true);
    try {
      const created = await addReview(
        product.id,
        reviewRating,
        reviewComment.trim(),
      );
      setReviews((prev) => [created, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      showToast('success', 'Review submitted');
    } catch {
      showToast('error', 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading product" />;
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600">{error ?? 'Product not found'}</p>
        <Link
          to={tenantPath('/products')}
          className="mt-4 inline-block text-[var(--color-primary)] hover:underline"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="space-y-12">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link to={tenantPath('/')} className="hover:text-[var(--color-primary)]">
          Home
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        {product.category && (
          <>
            <Link
              to={`${tenantPath('/products')}?categoryId=${product.category.id}`}
              className="hover:text-[var(--color-primary)]"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="size-4" aria-hidden />
          </>
        )}
        <span className="font-medium text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {galleryImages[selectedImage] ? (
              <img
                src={galleryImages[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <ImageOff className="size-16" />
              </div>
            )}
          </div>
          {galleryImages.length > 1 && (
            <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map((src, index) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`size-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                      index === selectedImage
                        ? 'border-[var(--color-primary)]'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <button
            type="button"
            onClick={scrollToReviews}
            className="mt-3 flex items-center gap-2 text-left transition-opacity hover:opacity-80"
          >
            <StarRating rating={averageRating} size="md" />
            <span className="text-sm text-gray-600 underline-offset-2 hover:underline">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </button>

          <p className="mt-4 text-3xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </p>

          <p
            className={`mt-2 text-sm font-medium ${
              inStock ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {inStock ? 'In Stock' : 'Out of Stock'}
            {inStock && (
              <span className="font-normal text-gray-500">
                {' '}
                ({product.stock} available)
              </span>
            )}
          </p>

          {inStock && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center rounded-lg border border-gray-300">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="rounded-l-lg p-2 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-10 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="rounded-r-lg p-2 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingToCart ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ShoppingCart className="size-5" />
              )}
              Add to Cart
            </button>

            {token && (
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                aria-label="Add to wishlist"
              >
                <Heart className="size-5" />
                Wishlist
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Description</h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          {product.description || 'No description available for this product.'}
        </p>
      </section>

      <section
        ref={reviewsRef}
        id="reviews"
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900">
          Customer Reviews ({reviews.length})
        </h2>

        <ul className="mt-6 space-y-6">
          {reviews.length === 0 && (
            <li className="text-sm text-gray-500">No reviews yet.</li>
          )}
          {reviews.map((review) => (
            <li
              key={review.id}
              className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-gray-900">
                  {review.user?.name ?? 'Anonymous'}
                </p>
                {review.createdAt && (
                  <time
                    dateTime={review.createdAt}
                    className="text-sm text-gray-500"
                  >
                    {formatReviewDate(review.createdAt)}
                  </time>
                )}
              </div>
              <div className="mt-1">
                <StarRating rating={review.rating} />
              </div>
              {review.comment && (
                <p className="mt-2 text-gray-600">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
          {token ? (
            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Your rating
                </span>
                <div className="mt-2">
                  <StarRatingInput
                    value={reviewRating}
                    onChange={setReviewRating}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="review-comment"
                  className="text-sm font-medium text-gray-700"
                >
                  Comment
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-70"
              >
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-gray-600">
              <Link
                to={tenantPath('/login')}
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                Login to write a review
              </Link>
            </p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900">Related Products</h2>
          <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
