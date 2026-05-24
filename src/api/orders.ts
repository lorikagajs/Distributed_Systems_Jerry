import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';
import { mapOrder } from './mappers';
import {
  mockCreateOrder,
  mockGetMyOrders,
  mockGetOrderById,
} from '../mocks/mockApi';
import type { Order, PaymentMethod, ShippingAddress } from '../types';

export interface CreateOrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderPaymentInput {
  method: PaymentMethod;
  cardLast4?: string;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  shipping: ShippingAddress;
  payment: CreateOrderPaymentInput;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (isMockMode()) {
    return mockCreateOrder(input);
  }

  const { data } = await axiosInstance.post<Parameters<typeof mapOrder>[0]>(
    '/orders',
    input,
  );
  return mapOrder(data);
}

export async function getMyOrders(): Promise<Order[]> {
  if (isMockMode()) {
    return mockGetMyOrders();
  }

  const { data } = await axiosInstance.get<Parameters<typeof mapOrder>[0][]>(
    '/orders',
  );
  return data.map(mapOrder);
}

export async function getOrderById(id: number): Promise<Order> {
  if (isMockMode()) {
    return mockGetOrderById(id);
  }

  const { data } = await axiosInstance.get<Parameters<typeof mapOrder>[0]>(
    `/orders/${id}`,
  );
  return mapOrder(data);
}
