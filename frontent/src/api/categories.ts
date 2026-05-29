import axiosInstance from './axiosInstance';
import { mapCategory } from './mappers';
import type { Category } from '../types';

export async function createCategory(name: string): Promise<Category> {
  const { data } = await axiosInstance.post<{ id: number; name: string }>(
    '/categories',
    { name },
  );
  return mapCategory(data);
}

export async function deleteCategory(id: number): Promise<void> {
  await axiosInstance.delete(`/categories/${id}`);
}
