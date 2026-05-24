import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';
import { mapCart } from './mappers';
import {
  mockAddToCart,
  mockClearCart,
  mockGetCart,
  mockRemoveCartItem,
  mockUpdateCartItem,
} from '../mocks/mockApi';
import type { Cart } from '../types';

export async function getCart(): Promise<Cart> {
  if (isMockMode()) {
    return mockGetCart();
  }

  const { data } = await axiosInstance.get<Parameters<typeof mapCart>[0]>('/cart');
  return mapCart(data);
}

export async function addToCart(
  productId: number,
  quantity: number,
): Promise<Cart> {
  if (isMockMode()) {
    return mockAddToCart(productId, quantity);
  }

  const { data } = await axiosInstance.post<Parameters<typeof mapCart>[0]>(
    '/cart/items',
    { productId, quantity },
  );
  return mapCart(data);
}

export async function updateCartItem(
  itemId: number,
  quantity: number,
): Promise<Cart> {
  if (isMockMode()) {
    return mockUpdateCartItem(itemId, quantity);
  }

  const { data } = await axiosInstance.put<Parameters<typeof mapCart>[0]>(
    `/cart/items/${itemId}`,
    { quantity },
  );
  return mapCart(data);
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  if (isMockMode()) {
    return mockRemoveCartItem(itemId);
  }

  const { data } = await axiosInstance.delete<Parameters<typeof mapCart>[0]>(
    `/cart/items/${itemId}`,
  );
  return mapCart(data);
}

export async function clearCart(): Promise<Cart> {
  if (isMockMode()) {
    return mockClearCart();
  }

  const { data } = await axiosInstance.delete<Parameters<typeof mapCart>[0]>(
    '/cart',
  );
  return mapCart(data);
}
