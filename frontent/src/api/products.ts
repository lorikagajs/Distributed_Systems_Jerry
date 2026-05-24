import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';
import { mapCategory, mapProduct } from './mappers';
import {
  mockGetCategories,
  mockGetProductById,
  mockGetProducts,
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

export async function getProducts(
  params?: GetProductsParams,
): Promise<PaginatedProducts> {
  if (isMockMode()) {
    return mockGetProducts(params);
  }

  const { search, categoryId, ...rest } = params ?? {};
  const { data } = await axiosInstance.get<PaginatedProductsResponse>(
    '/products',
    {
      params: {
        ...rest,
        ...(search ? { search } : {}),
        ...(categoryId?.length ? { categoryId } : {}),
      },
    },
  );

  return {
    data: data.data.map(mapProduct),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
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
