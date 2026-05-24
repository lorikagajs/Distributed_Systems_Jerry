import axiosInstance from './axiosInstance';
import type { Cart } from '../types';

export const getCart = async (): Promise<Cart> => {
  const response = await axiosInstance.get<Cart>('/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number): Promise<Cart> => {
  const response = await axiosInstance.post<Cart>('/cart/items', { productId, quantity });
  return response.data;
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  const response = await axiosInstance.put<Cart>('/cart/items/' + itemId, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId: string): Promise<Cart> => {
  const response = await axiosInstance.delete<Cart>('/cart/items/' + itemId);
  return response.data;
};

export const clearCart = async (): Promise<void> => {
  await axiosInstance.delete('/cart');
};
