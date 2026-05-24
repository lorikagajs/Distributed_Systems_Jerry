import axios from 'axios';
import type {
  TenantConfig,
  TenantListItem,
} from '../api/tenants';
import type {
  GetProductsParams,
  PaginatedProducts,
  ProductSort,
} from '../api/products';
import { PRODUCTS_PAGE_SIZE } from '../api/products';
import { getTenantId } from '../api/axiosInstance';
import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_TENANT_CONFIGS,
  MOCK_TENANT_LIST,
} from './data';
import type { Cart, CartItem, Category, Order, Product, Review } from '../types';

const delay = (ms = 300) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const mockCartsByTenant: Record<number, Cart> = {};

function recalcCartTotal(cart: Cart): Cart {
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return { ...cart, total };
}

function getMockCartStore(): Cart {
  const tenantId = getTenantId() ?? 0;
  if (!mockCartsByTenant[tenantId]) {
    mockCartsByTenant[tenantId] = { id: 1, items: [], total: 0 };
  }
  return mockCartsByTenant[tenantId];
}

function setMockCartStore(cart: Cart) {
  const tenantId = getTenantId() ?? 0;
  mockCartsByTenant[tenantId] = recalcCartTotal(cart);
}

export async function mockGetAllTenants(): Promise<TenantListItem[]> {
  await delay();
  return MOCK_TENANT_LIST;
}

export async function mockGetTenantConfig(slug: string): Promise<TenantConfig> {
  await delay();
  const config = MOCK_TENANT_CONFIGS[slug];
  if (!config) {
    throw new axios.AxiosError(
      'Tenant not found',
      'ERR_NOT_FOUND',
      undefined,
      undefined,
      {
        status: 404,
        statusText: 'Not Found',
        data: { message: 'Tenant not found' },
        headers: {},
        config: {} as never,
      },
    );
  }
  return config;
}

export async function mockGetCategories(): Promise<Category[]> {
  await delay(200);
  const tenantId = getTenantId();
  if (!tenantId) return [];
  return MOCK_CATEGORIES[tenantId] ?? [];
}

function sortProducts(products: Product[], sort?: ProductSort): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'popular':
      return copy.sort((a, b) => (b.ratings ?? 0) - (a.ratings ?? 0));
    case 'newest':
    default:
      return copy.sort((a, b) => b.id - a.id);
  }
}

export async function mockGetProducts(
  params?: GetProductsParams,
): Promise<PaginatedProducts> {
  await delay(350);
  const tenantId = getTenantId();
  if (!tenantId) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: params?.limit ?? PRODUCTS_PAGE_SIZE,
      totalPages: 1,
    };
  }

  let items = [...(MOCK_PRODUCTS[tenantId] ?? [])];

  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }

  if (params?.categoryId?.length) {
    items = items.filter((p) => params.categoryId!.includes(p.categoryId));
  }

  if (params?.minPrice != null) {
    items = items.filter((p) => p.price >= params.minPrice!);
  }
  if (params?.maxPrice != null) {
    items = items.filter((p) => p.price <= params.maxPrice!);
  }
  if (params?.minRating != null) {
    items = items.filter((p) => (p.ratings ?? 0) >= params.minRating!);
  }

  items = sortProducts(items, params?.sort);

  const page = params?.page ?? 1;
  const limit = params?.limit ?? PRODUCTS_PAGE_SIZE;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const data = items.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}

export async function mockGetProductById(id: number): Promise<Product> {
  await delay(200);
  const tenantId = getTenantId();
  const product = MOCK_PRODUCTS[tenantId ?? 0]?.find((p) => p.id === id);
  if (!product) {
    throw new axios.AxiosError('Product not found', 'ERR_NOT_FOUND');
  }
  return product;
}

export async function mockGetProductReviews(
  productId: number,
): Promise<Review[]> {
  await delay(200);
  return MOCK_REVIEWS[productId] ?? [];
}

export async function mockGetCart(): Promise<Cart> {
  await delay(200);
  return { ...getMockCartStore() };
}

export async function mockAddToCart(
  productId: number,
  quantity: number,
): Promise<Cart> {
  await delay(200);
  const tenantId = getTenantId();
  const product = MOCK_PRODUCTS[tenantId ?? 0]?.find((p) => p.id === productId);
  if (!product) {
    throw new axios.AxiosError('Product not found', 'ERR_NOT_FOUND');
  }

  const cart = getMockCartStore();
  const existing = cart.items.find((i) => i.productId === productId);

  let items: CartItem[];
  if (existing) {
    items = cart.items.map((i) =>
      i.productId === productId
        ? { ...i, quantity: i.quantity + quantity }
        : i,
    );
  } else {
    items = [
      ...cart.items,
      {
        id: Date.now(),
        productId,
        product,
        quantity,
        price: product.price,
      },
    ];
  }

  const updated = recalcCartTotal({ ...cart, items });
  setMockCartStore(updated);
  return { ...updated };
}

export async function mockUpdateCartItem(
  itemId: number,
  quantity: number,
): Promise<Cart> {
  await delay(150);
  const cart = getMockCartStore();
  const items = cart.items.map((i) =>
    i.id === itemId ? { ...i, quantity } : i,
  );
  const updated = recalcCartTotal({ ...cart, items });
  setMockCartStore(updated);
  return { ...updated };
}

export async function mockRemoveCartItem(itemId: number): Promise<Cart> {
  await delay(150);
  const cart = getMockCartStore();
  const updated = recalcCartTotal({
    ...cart,
    items: cart.items.filter((i) => i.id !== itemId),
  });
  setMockCartStore(updated);
  return { ...updated };
}

export async function mockClearCart(): Promise<Cart> {
  await delay(150);
  const empty = { id: 1, items: [], total: 0 };
  setMockCartStore(empty);
  return { ...empty };
}

export async function mockCreateOrder(
  items: { productId: number; quantity: number }[],
): Promise<Order> {
  await delay(400);
  const tenantId = getTenantId() ?? 0;
  const products = MOCK_PRODUCTS[tenantId] ?? [];
  const orderItems = items.map((item, index) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      id: Date.now() + index,
      productId: item.productId,
      product,
      quantity: item.quantity,
      price: product.price,
    };
  });
  const total = orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  setMockCartStore({ id: 1, items: [], total: 0 });
  return {
    id: Math.floor(Date.now() / 1000),
    status: 'PENDING',
    total,
    items: orderItems,
    createdAt: new Date().toISOString(),
  };
}

export async function mockAddReview(
  productId: number,
  rating: number,
  comment: string,
): Promise<Review> {
  await delay(300);
  const review: Review = {
    id: Date.now(),
    userId: 99,
    productId,
    rating,
    comment,
    user: {
      id: 99,
      name: 'You',
      email: 'you@example.com',
      role: 'CUSTOMER',
    },
    createdAt: new Date().toISOString(),
  };
  if (!MOCK_REVIEWS[productId]) {
    MOCK_REVIEWS[productId] = [];
  }
  MOCK_REVIEWS[productId].unshift(review);
  return review;
}
