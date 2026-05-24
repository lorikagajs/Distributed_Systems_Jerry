import axiosInstance from './axiosInstance';
import type { Order } from '../types';

export const createOrder = async (cartId: string): Promise<Order> => {
  const response = await axiosInstance.post<Order>('/orders', { cartId });
  return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>('/orders/my');
  return response.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await axiosInstance.get<Order>('/orders/' + id);
  return response.data;
};
