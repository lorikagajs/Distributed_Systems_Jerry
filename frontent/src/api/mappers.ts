import type {
  Cart,
  CartItem,
  Category,
  Wishlist,
  WishlistItem,
  Order,
  OrderItem,
  OrderPayment,
  PaymentMethod,
  Product,
  ProductImageRecord,
  Review,
  User,
  UserProfile,
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
  compareAtPrice?: unknown | null;
  stock: number;
  imageUrl?: string | null;
  categoryId: number;
  tenantId: number;
  category?: { id: number; name: string } | null;
  images?: {
    id: string;
    url: string;
    publicId?: string;
    isPrimary?: boolean;
  }[];
  averageRating?: number | null;
  ratings?: number | null;
}): Product {
  const imageRecords: ProductImageRecord[] = (raw.images ?? [])
    .filter((img) => Boolean(img.url))
    .map((img) => ({
      id: img.id,
      url: img.url,
      publicId: img.publicId ?? '',
      isPrimary: img.isPrimary ?? false,
    }))
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  const galleryUrls = imageRecords.map((img) => img.url);
  const primaryRecord =
    imageRecords.find((img) => img.isPrimary) ?? imageRecords[0];
  const imageUrl = raw.imageUrl ?? primaryRecord?.url ?? null;
  const images =
    galleryUrls.length > 0 ? galleryUrls : imageUrl ? [imageUrl] : [];

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    price: toNumber(raw.price),
    compareAtPrice:
      raw.compareAtPrice != null ? toNumber(raw.compareAtPrice) : null,
    stock: raw.stock,
    imageUrl,
    images,
    imageRecords,
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
  product?: Parameters<typeof mapProduct>[0] | null;
}): CartItem {
  const product = mapProduct(
    raw.product ?? {
      id: raw.productId,
      name: 'Product',
      price: 0,
      stock: 0,
      categoryId: 0,
      tenantId: 0,
    },
  );
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
  items?: Parameters<typeof mapCartItem>[0][] | null;
}): Cart {
  const items = (raw.items ?? []).map(mapCartItem);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return { id: raw.id, items, total };
}

export function mapWishlistItem(raw: {
  id: number;
  productId: number;
  product: Parameters<typeof mapProduct>[0];
}): WishlistItem {
  return {
    id: raw.id,
    productId: raw.productId,
    product: mapProduct(raw.product),
  };
}

export function mapWishlist(raw: {
  id: number;
  items?: Parameters<typeof mapWishlistItem>[0][] | null;
}): Wishlist {
  return {
    id: raw.id,
    items: (raw.items ?? []).map(mapWishlistItem),
  };
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

function mapShippingAddress(raw: {
  line1?: string;
  line2?: string | null;
  street?: string;
  city: string;
  state?: string | null;
  postalCode?: string;
  zipCode?: string;
  country: string;
} | null | undefined): Order['shippingAddress'] {
  if (!raw) return null;
  const line1 = raw.line1 ?? raw.street;
  if (!line1 || !raw.city || !raw.country) return null;
  return {
    line1,
    line2: raw.line2 ?? null,
    city: raw.city,
    state: raw.state ?? null,
    postalCode: raw.postalCode ?? raw.zipCode ?? '',
    country: raw.country,
  };
}

function mapOrderPayment(raw: {
  id: number;
  method: string;
  status: string;
  amount: unknown;
  createdAt: string;
}): OrderPayment {
  return {
    id: raw.id,
    method: raw.method as PaymentMethod,
    status: raw.status,
    amount: toNumber(raw.amount),
    createdAt: raw.createdAt,
  };
}

export function mapOrder(raw: {
  id: number;
  status: string;
  totalAmount: unknown;
  createdAt: string;
  items?: Parameters<typeof mapOrderItem>[0][];
  user?: { id: number; email: string; name?: string | null } | null;
  shippingAddress?: Parameters<typeof mapShippingAddress>[0];
  address?: Parameters<typeof mapShippingAddress>[0];
  payments?: {
    id: number;
    method: string;
    status: string;
    amount: unknown;
    createdAt: string;
  }[];
}): Order {
  return {
    id: raw.id,
    status: raw.status,
    total: toNumber(raw.totalAmount),
    items: (raw.items ?? []).map(mapOrderItem),
    createdAt: raw.createdAt,
    shippingAddress:
      mapShippingAddress(raw.shippingAddress) ??
      mapShippingAddress(raw.address),
    payments: raw.payments?.map(mapOrderPayment),
    customer: raw.user
      ? {
          id: raw.user.id,
          email: raw.user.email,
          name: resolveDisplayName(raw.user),
        }
      : null,
  };
}

function resolveDisplayName(raw: {
  name?: string | null;
  email: string;
}): string {
  const trimmed = raw.name?.trim();
  if (trimmed) return trimmed;
  return raw.email.split('@')[0];
}

export function mapUserProfile(raw: {
  id: number;
  email: string;
  name?: string | null;
  role: string;
  tenantId?: number;
  createdAt?: string;
}): UserProfile {
  return {
    id: raw.id,
    email: raw.email,
    name: resolveDisplayName(raw),
    role: raw.role,
    tenantId: raw.tenantId,
    createdAt: raw.createdAt,
  };
}

export function mapReview(raw: {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  user?: { id: number; email: string; name?: string | null } | null;
  product?: { id: number; name: string } | null;
  createdAt?: string;
}): Review {
  const user: User | null = raw.user
    ? {
        id: raw.user.id,
        name: resolveDisplayName(raw.user),
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
    product: raw.product ?? null,
    createdAt: raw.createdAt ?? '',
  };
}
