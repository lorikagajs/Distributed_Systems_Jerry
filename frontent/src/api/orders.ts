import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';
import { mapOrder } from './mappers';
import { mockCreateOrder } from '../mocks/mockApi';
import type { Order } from '../types';

export interface CreateOrderItemInput {
  productId: number;
  quantity: number;
}

export async function createOrder(
  items: CreateOrderItemInput[],
): Promise<Order> {
  if (isMockMode()) {
    return mockCreateOrder(items);
  }

  const { data } = await axiosInstance.post<Parameters<typeof mapOrder>[0]>(
    '/orders',
    { items },
  );
  return mapOrder(data);
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await axiosInstance.get<Parameters<typeof mapOrder>[0][]>(
    '/orders',
  );
  return data.map(mapOrder);
}

export async function getOrderById(id: number): Promise<Order> {
  const { data } = await axiosInstance.get<Parameters<typeof mapOrder>[0]>(
    `/orders/${id}`,
  );
  return mapOrder(data);
}
