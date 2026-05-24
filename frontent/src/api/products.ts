import axiosInstance from './axiosInstance';
import type { Product, Category } from '../types';

interface ProductParams {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getProducts = async (params?: ProductParams): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>('/products', { params });
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get<Product>('/products/' + id);
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<Category[]>('/categories');
  return response.data;
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await axiosInstance.get<Category>('/categories/' + id);
  return response.data;
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>('/products', { params: { categoryId } });
  return response.data;
};
