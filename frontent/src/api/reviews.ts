import axiosInstance from './axiosInstance';
import type { Review } from '../types';

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const response = await axiosInstance.get<Review[]>('/products/' + productId + '/reviews');
  return response.data;
};

export const addReview = async (productId: string, rating: number, comment: string): Promise<Review> => {
  const response = await axiosInstance.post<Review>('/products/' + productId + '/reviews', { rating, comment });
  return response.data;
};
