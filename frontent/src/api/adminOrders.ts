import axiosInstance from './axiosInstance';
import { mapOrder } from './mappers';
import type { Order } from '../types';

export async function getAdminOrders(): Promise<Order[]> {
  const { data } = await axiosInstance.get<Parameters<typeof mapOrder>[0][]>(
    '/orders/manage/all',
  );
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(mapOrder);
}

export async function getAdminOrderById(id: number): Promise<Order> {
  const { data } = await axiosInstance.get<Parameters<typeof mapOrder>[0]>(
    `/orders/manage/${id}`,
  );
  return mapOrder(data);
}

export async function acceptOrder(id: number): Promise<Order> {
  const { data } = await axiosInstance.patch<Parameters<typeof mapOrder>[0]>(
    `/orders/${id}/accept`,
  );
  return mapOrder(data);
}

export async function updateOrderStatus(
  id: number,
  status: string,
): Promise<Order> {
  const { data } = await axiosInstance.patch<Parameters<typeof mapOrder>[0]>(
    `/orders/${id}/status`,
    { status },
  );
  return mapOrder(data);
}
