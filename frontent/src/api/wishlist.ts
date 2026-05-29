import axiosInstance from './axiosInstance';
import { mapWishlist } from './mappers';
import type { Wishlist } from '../types';

export async function getWishlist(): Promise<Wishlist> {
  const { data } = await axiosInstance.get<Parameters<typeof mapWishlist>[0]>(
    '/wishlist',
  );
  return mapWishlist(data);
}

export async function addToWishlist(productId: number): Promise<Wishlist> {
  const { data } = await axiosInstance.post<Parameters<typeof mapWishlist>[0]>(
    '/wishlist/items',
    { productId },
  );
  return mapWishlist(data);
}

export async function removeFromWishlist(productId: number): Promise<Wishlist> {
  const { data } = await axiosInstance.delete<Parameters<typeof mapWishlist>[0]>(
    `/wishlist/items/${productId}`,
  );
  return mapWishlist(data);
}
