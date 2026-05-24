import type {
  Cart,
  CartItem,
  Category,
  Order,
  OrderItem,
  Product,
  Review,
  User,
} from '../types';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value);
  return 0;
}

export function mapCategory(raw: {
  id: number;
  name: string;
  tenantId?: number;
}): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: slugify(raw.name),
    description: null,
    imageUrl: null,
  };
}

export function mapProduct(raw: {
  id: number;
  name: string;
  description?: string | null;
  price: unknown;
  stock: number;
  imageUrl?: string | null;
  categoryId: number;
  tenantId: number;
  category?: { id: number; name: string } | null;
  images?: { url: string }[];
  averageRating?: number | null;
  ratings?: number | null;
}): Product {
  const galleryUrls =
    raw.images?.map((img) => img.url).filter(Boolean) ?? [];
  const imageUrl =
    raw.imageUrl ?? (galleryUrls.length > 0 ? galleryUrls[0] : null);
  const images =
    galleryUrls.length > 0
      ? galleryUrls
      : imageUrl
        ? [imageUrl]
        : [];

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    price: toNumber(raw.price),
    stock: raw.stock,
    imageUrl,
    images,
    categoryId: raw.categoryId,
    category: raw.category ? mapCategory(raw.category) : null,
    tenantId: raw.tenantId,
    ratings:
      raw.averageRating != null
        ? Number(raw.averageRating)
        : raw.ratings != null
          ? Number(raw.ratings)
          : null,
    createdAt: '',
  };
}

export function mapCartItem(raw: {
  id: number;
  productId: number;
  quantity: number;
  product: Parameters<typeof mapProduct>[0];
}): CartItem {
  const product = mapProduct(raw.product);
  return {
    id: raw.id,
    productId: raw.productId,
    product,
    quantity: raw.quantity,
    price: product.price,
  };
}

export function mapCart(raw: {
  id: number;
  items: Parameters<typeof mapCartItem>[0][];
}): Cart {
  const items = raw.items.map(mapCartItem);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return { id: raw.id, items, total };
}

export function mapOrderItem(raw: {
  id: number;
  productId: number;
  quantity: number;
  price: unknown;
  product: Parameters<typeof mapProduct>[0];
}): OrderItem {
  const product = mapProduct(raw.product);
  return {
    id: raw.id,
    productId: raw.productId,
    product,
    quantity: raw.quantity,
    price: toNumber(raw.price),
  };
}

export function mapOrder(raw: {
  id: number;
  status: string;
  totalAmount: unknown;
  createdAt: string;
  items: Parameters<typeof mapOrderItem>[0][];
}): Order {
  return {
    id: raw.id,
    status: raw.status,
    total: toNumber(raw.totalAmount),
    items: raw.items.map(mapOrderItem),
    createdAt: raw.createdAt,
  };
}

export function mapReview(raw: {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  user?: { id: number; email: string } | null;
}): Review {
  const user: User | null = raw.user
    ? {
        id: raw.user.id,
        name: raw.user.email.split('@')[0],
        email: raw.user.email,
        role: 'CUSTOMER',
      }
    : null;

  return {
    id: raw.id,
    userId: raw.userId,
    productId: raw.productId,
    rating: raw.rating,
    comment: raw.comment,
    user,
    createdAt: '',
  };
}
