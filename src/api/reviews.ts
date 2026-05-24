import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';
import { mapReview } from './mappers';
import { mockAddReview, mockGetProductReviews } from '../mocks/mockApi';
import type { Review } from '../types';

export async function getProductReviews(productId: number): Promise<Review[]> {
  if (isMockMode()) {
    return mockGetProductReviews(productId);
  }

  const { data } = await axiosInstance.get<Parameters<typeof mapReview>[0][]>(
    '/reviews',
    { params: { productId } },
  );
  return data.map(mapReview);
}

export async function addReview(
  productId: number,
  rating: number,
  comment: string,
): Promise<Review> {
  if (isMockMode()) {
    return mockAddReview(productId, rating, comment);
  }

  const { data } = await axiosInstance.post<Parameters<typeof mapReview>[0]>(
    '/reviews',
    { productId, rating, comment },
  );
  return mapReview(data);
}
