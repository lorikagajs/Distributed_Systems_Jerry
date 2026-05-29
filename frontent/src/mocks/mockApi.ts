import axios from 'axios';
import type { CreateOrderInput } from '../api/orders';
import type {
  TenantConfig,
  TenantListItem,
} from '../api/tenants';
import type {
  CreateProductPayload,
  GetProductsParams,
  PaginatedProducts,
  ProductSort,
  UpdateProductPayload,
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
import type {
  Cart,
  CartItem,
  Category,
  Order,
  Product,
  Review,
  UserProfile,
} from '../types';

const delay = (ms = 300) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const mockProductsStore: Record<number, Product[]> = {};

function getMockProductsForTenant(tenantId: number): Product[] {
  if (!mockProductsStore[tenantId]) {
    mockProductsStore[tenantId] = (MOCK_PRODUCTS[tenantId] ?? []).map((p) => ({
      ...p,
    }));
  }
  return mockProductsStore[tenantId];
}

const mockCartsByTenant: Record<number, Cart> = {};
const mockOrdersByTenant: Record<number, Order[]> = {};
const mockProfilesByTenant: Record<number, UserProfile> = {};

const MOCK_DEFAULT_PROFILE: UserProfile = {
  id: 99,
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'CUSTOMER',
};

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

  let items = [...getMockProductsForTenant(tenantId)];

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
  const product = getMockProductsForTenant(tenantId ?? 0).find((p) => p.id === id);
  if (!product) {
    throw new axios.AxiosError('Product not found', 'ERR_NOT_FOUND');
  }
  return product;
}

export async function mockCreateProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  await delay(300);
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new axios.AxiosError('Tenant required', 'ERR_BAD_REQUEST');
  }

  const categories = MOCK_CATEGORIES[tenantId] ?? [];
  const category = categories.find((c) => c.id === payload.categoryId);
  if (!category) {
    throw new axios.AxiosError('Category not found', 'ERR_NOT_FOUND');
  }

  const products = getMockProductsForTenant(tenantId);
  const nextId =
    products.reduce((max, p) => Math.max(max, p.id), tenantId * 100) + 1;

  const images = payload.imageUrl ? [payload.imageUrl] : [];
  const product: Product = {
    id: nextId,
    name: payload.name,
    description: payload.description ?? null,
    price: payload.price,
    stock: payload.stock,
    categoryId: payload.categoryId,
    tenantId,
    imageUrl: payload.imageUrl ?? null,
    images,
    imageRecords: images.map((url, index) => ({
      id: `mock-${nextId}-${index}`,
      url,
      publicId: '',
      isPrimary: index === 0,
    })),
    category,
    ratings: null,
    createdAt: new Date().toISOString(),
  };

  products.unshift(product);
  return product;
}

export async function mockUpdateProduct(
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  await delay(300);
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new axios.AxiosError('Tenant required', 'ERR_BAD_REQUEST');
  }

  const products = getMockProductsForTenant(tenantId);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new axios.AxiosError('Product not found', 'ERR_NOT_FOUND');
  }

  const current = products[index];
  const categories = MOCK_CATEGORIES[tenantId] ?? [];
  const categoryId = payload.categoryId ?? current.categoryId;
  const category =
    categories.find((c) => c.id === categoryId) ?? current.category;

  const imageUrl =
    payload.imageUrl !== undefined ? payload.imageUrl : current.imageUrl;

  const images =
    imageUrl != null
      ? [imageUrl, ...current.images.filter((u) => u !== imageUrl)]
      : current.images;

  const updated: Product = {
    ...current,
    ...payload,
    categoryId,
    category,
    imageUrl,
    images,
    imageRecords: images.map((url, index) => ({
      id: `mock-${id}-${index}`,
      url,
      publicId: '',
      isPrimary: index === 0,
    })),
  };

  products[index] = updated;
  return updated;
}

export async function mockDeleteProduct(id: number): Promise<void> {
  await delay(300);
  const tenantId = getTenantId();
  if (!tenantId) return;

  const products = getMockProductsForTenant(tenantId);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new axios.AxiosError('Product not found', 'ERR_NOT_FOUND');
  }
  products.splice(index, 1);
}

export async function mockUploadProductImage(
  id: number,
  file: File,
): Promise<Product> {
  await delay(400);
  const objectUrl = URL.createObjectURL(file);
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new axios.AxiosError('Tenant required', 'ERR_BAD_REQUEST');
  }

  const products = getMockProductsForTenant(tenantId);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new axios.AxiosError('Product not found', 'ERR_NOT_FOUND');
  }

  const current = products[index];
  const imageUrl = current.imageUrl ?? objectUrl;
  const images = [...current.images, objectUrl];

  const updated: Product = {
    ...current,
    imageUrl,
    images,
    imageRecords: [
      ...current.imageRecords,
      {
        id: `mock-upload-${Date.now()}`,
        url: objectUrl,
        publicId: '',
        isPrimary: !current.imageUrl,
      },
    ],
  };

  products[index] = updated;
  return updated;
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
  const product = getMockProductsForTenant(tenantId ?? 0).find(
    (p) => p.id === productId,
  );
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

export async function mockCreateOrder(input: CreateOrderInput): Promise<Order> {
  await delay(400);
  const tenantId = getTenantId() ?? 0;
  const products = getMockProductsForTenant(tenantId);
  const orderItems = input.items.map((item, index) => {
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
  const order: Order = {
    id: Math.floor(Date.now() / 1000),
    status: 'CONFIRMED',
    total,
    items: orderItems,
    createdAt: new Date().toISOString(),
    shippingAddress: input.shipping,
    payments: [
      {
        id: Date.now(),
        method: input.payment.method,
        status: 'COMPLETED',
        amount: total,
        createdAt: new Date().toISOString(),
      },
    ],
  };
  if (!mockOrdersByTenant[tenantId]) {
    mockOrdersByTenant[tenantId] = [];
  }
  mockOrdersByTenant[tenantId].unshift(order);
  return order;
}

export async function mockGetMyOrders(): Promise<Order[]> {
  await delay(300);
  const tenantId = getTenantId() ?? 0;
  return [...(mockOrdersByTenant[tenantId] ?? [])];
}

export async function mockGetOrderById(id: number): Promise<Order> {
  await delay(300);
  const tenantId = getTenantId() ?? 0;
  const order = (mockOrdersByTenant[tenantId] ?? []).find((o) => o.id === id);
  if (!order) {
    throw new Error('Order not found');
  }
  return { ...order };
}

function getMockProfileStore(): UserProfile {
  const tenantId = getTenantId() ?? 0;
  if (!mockProfilesByTenant[tenantId]) {
    mockProfilesByTenant[tenantId] = { ...MOCK_DEFAULT_PROFILE };
  }
  return mockProfilesByTenant[tenantId];
}

export async function mockGetMyProfile(): Promise<UserProfile> {
  await delay(200);
  return { ...getMockProfileStore() };
}

export async function mockUpdateProfile(name: string): Promise<UserProfile> {
  await delay(300);
  const profile = getMockProfileStore();
  profile.name = name.trim();
  return { ...profile };
}

export async function mockChangePassword(
  currentPassword: string,
  _newPassword: string,
): Promise<void> {
  await delay(300);
  if (currentPassword.length < 8) {
    throw new Error('Current password is incorrect');
  }
}

export async function mockDeleteAccount(): Promise<void> {
  await delay(400);
  const tenantId = getTenantId() ?? 0;
  delete mockProfilesByTenant[tenantId];
  mockOrdersByTenant[tenantId] = [];
  setMockCartStore({ id: 1, items: [], total: 0 });
}

export async function mockGetMyReviews(): Promise<Review[]> {
  await delay(300);
  const tenantId = getTenantId() ?? 0;
  const products = getMockProductsForTenant(tenantId);
  const reviews: Review[] = [];

  for (const [productIdStr, productReviews] of Object.entries(MOCK_REVIEWS)) {
    const productId = Number(productIdStr);
    const product = products.find((p) => p.id === productId);
    for (const review of productReviews) {
      if (review.userId === MOCK_DEFAULT_PROFILE.id) {
        reviews.push({
          ...review,
          product: product
            ? { id: product.id, name: product.name }
            : { id: productId, name: `Product #${productId}` },
        });
      }
    }
  }

  return reviews.sort((a, b) => b.id - a.id);
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
