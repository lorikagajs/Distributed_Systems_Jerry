import axiosInstance from './axiosInstance';
import { mapUserProfile } from './mappers';
import type { AdminCustomer } from '../types';

export type { AdminCustomer };

function mapAdminCustomer(raw: {
  id: number;
  email: string;
  name?: string | null;
  role: string;
  tenantId?: number;
  createdAt?: string;
  isBlocked?: boolean;
  _count?: { orders: number };
}): AdminCustomer {
  const profile = mapUserProfile(raw);
  return {
    ...profile,
    isBlocked: raw.isBlocked ?? false,
    orderCount: raw._count?.orders ?? 0,
  };
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const { data } = await axiosInstance.get<
    Parameters<typeof mapAdminCustomer>[0][]
  >('/users');
  return data.map(mapAdminCustomer);
}

export async function getAdminCustomer(id: number): Promise<AdminCustomer> {
  const { data } = await axiosInstance.get<Parameters<typeof mapAdminCustomer>[0]>(
    `/users/${id}`,
  );
  return mapAdminCustomer(data);
}

export interface CreateCustomerPayload {
  email: string;
  password: string;
  name?: string;
}

export async function createCustomer(
  payload: CreateCustomerPayload,
): Promise<AdminCustomer> {
  const { data } = await axiosInstance.post<Parameters<typeof mapAdminCustomer>[0]>(
    '/users',
    { ...payload, role: 'CUSTOMER' },
  );
  return mapAdminCustomer(data);
}

export async function setCustomerBlocked(
  id: number,
  isBlocked: boolean,
): Promise<AdminCustomer> {
  const { data } = await axiosInstance.patch<Parameters<typeof mapAdminCustomer>[0]>(
    `/users/${id}/block`,
    { isBlocked },
  );
  return mapAdminCustomer(data);
}
