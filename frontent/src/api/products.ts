import axiosInstance from './axiosInstance';
import { serializeQueryParams } from './queryParams';
import { isMockMode } from '../config/env';
import { mapCategory, mapProduct } from './mappers';
import {
  mockCreateProduct,
  mockDeleteProduct,
  mockGetCategories,
  mockGetProductById,
  mockGetProducts,
  mockUpdateProduct,
  mockUploadProductImage,
} from '../mocks/mockApi';
import type { Category, Product } from '../types';

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'popular';

export interface GetProductsParams {
  categoryId?: number[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedProductsResponse {
  data: Parameters<typeof mapProduct>[0][];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const PRODUCTS_PAGE_SIZE = 12;

function isPaginatedResponse(
  value: unknown,
): value is PaginatedProductsResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as PaginatedProductsResponse).data) &&
    typeof (value as PaginatedProductsResponse).total === 'number'
  );
}

export async function getProducts(
  params?: GetProductsParams,
): Promise<PaginatedProducts> {
  if (isMockMode()) {
    return mockGetProducts(params);
  }

  const { search, categoryId, sort, page, limit, minPrice, maxPrice, minRating } =
    params ?? {};

  const { data } = await axiosInstance.get<unknown>('/products', {
    params: {
      search: search || undefined,
      categoryId: categoryId?.length ? categoryId : undefined,
      sort: sort || undefined,
      page: page ?? 1,
      limit: limit ?? PRODUCTS_PAGE_SIZE,
      minPrice,
      maxPrice,
      minRating,
    },
    paramsSerializer: (params) =>
      serializeQueryParams(params as Record<string, string | number | number[] | undefined>),
  });

  if (isPaginatedResponse(data)) {
    return {
      data: data.data.map(mapProduct),
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };
  }

  if (Array.isArray(data)) {
    const mapped = data.map((item) =>
      mapProduct(item as Parameters<typeof mapProduct>[0]),
    );
    const total = mapped.length;
    const pageNum = page ?? 1;
    const limitNum = limit ?? PRODUCTS_PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const start = (pageNum - 1) * limitNum;
    return {
      data: mapped.slice(start, start + limitNum),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  return {
    data: [],
    total: 0,
    page: 1,
    limit: PRODUCTS_PAGE_SIZE,
    totalPages: 1,
  };
}

export async function getProductById(id: number): Promise<Product> {
  if (isMockMode()) {
    return mockGetProductById(id);
  }

  const { data } = await axiosInstance.get<Parameters<typeof mapProduct>[0]>(
    `/products/${id}`,
  );
  return mapProduct(data);
}

export async function getCategories(): Promise<Category[]> {
  if (isMockMode()) {
    return mockGetCategories();
  }

  const { data } = await axiosInstance.get<{ id: number; name: string }[]>(
    '/categories',
  );
  return data.map(mapCategory);
}

export async function getCategoryById(id: number): Promise<Category> {
  const { data } = await axiosInstance.get<{ id: number; name: string }>(
    `/categories/${id}`,
  );
  return mapCategory(data);
}

export async function getProductsByCategory(
  categoryId: number,
): Promise<PaginatedProducts> {
  return getProducts({ categoryId: [categoryId], limit: PRODUCTS_PAGE_SIZE });
}

export interface ProductImageInput {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  categoryId: number;
  imageUrl?: string;
  imageUrls?: ProductImageInput[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  if (isMockMode()) {
    return mockCreateProduct(payload);
  }

  const { data } = await axiosInstance.post<Parameters<typeof mapProduct>[0]>(
    '/products',
    payload,
  );
  return mapProduct(data);
}

export async function updateProduct(
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  if (isMockMode()) {
    return mockUpdateProduct(id, payload);
  }

  const { data } = await axiosInstance.put<Parameters<typeof mapProduct>[0]>(
    `/products/${id}`,
    payload,
  );
  return mapProduct(data);
}

export async function deleteProduct(id: number): Promise<void> {
  if (isMockMode()) {
    return mockDeleteProduct(id);
  }

  await axiosInstance.delete(`/products/${id}`);
}

export async function uploadProductImage(
  id: number,
  file: File,
): Promise<Product> {
  if (isMockMode()) {
    return mockUploadProductImage(id, file);
  }

  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axiosInstance.post<Parameters<typeof mapProduct>[0]>(
    `/products/${id}/image`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return mapProduct(data);
}

export async function uploadProductImages(
  id: number,
  files: File[],
): Promise<Product> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }

  const { data } = await axiosInstance.post<Parameters<typeof mapProduct>[0]>(
    `/products/${id}/images`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return mapProduct(data);
}
