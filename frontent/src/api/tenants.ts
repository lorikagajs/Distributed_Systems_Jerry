import axios from 'axios';
import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';
import { mockGetAllTenants, mockGetTenantConfig } from '../mocks/mockApi';

export interface TenantConfig {
  tenantId: number;
  slug: string;
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  bannerUrl: string | null;
  storeDescription: string | null;
}

export interface TenantListItem {
  slug: string;
  storeName: string;
  storeDescription: string | null;
  primaryColor: string;
  secondaryColor: string;
  bannerUrl: string | null;
}

interface BackendTenant {
  id: number;
  name: string;
  slug: string;
  email: string;
  isActive: boolean;
  tenantSettings?: {
    logoUrl: string | null;
    primaryColor: string | null;
    currency: string;
  } | null;
}

const DEFAULT_PRIMARY = '#4f46e5';
const DEFAULT_SECONDARY = '#7c3aed';

function mapTenantConfig(tenant: BackendTenant): TenantConfig {
  const settings = tenant.tenantSettings;
  return {
    tenantId: tenant.id,
    slug: tenant.slug,
    storeName: tenant.name,
    logoUrl: settings?.logoUrl ?? null,
    primaryColor: settings?.primaryColor ?? DEFAULT_PRIMARY,
    secondaryColor: DEFAULT_SECONDARY,
    bannerUrl: null,
    storeDescription: null,
  };
}

function mapTenantListItem(t: BackendTenant): TenantListItem {
  const settings = t.tenantSettings;
  return {
    slug: t.slug,
    storeName: t.name,
    storeDescription: null,
    primaryColor: settings?.primaryColor ?? DEFAULT_PRIMARY,
    secondaryColor: DEFAULT_SECONDARY,
    bannerUrl: null,
  };
}

export async function getTenantConfig(slug: string): Promise<TenantConfig> {
  if (isMockMode()) {
    return mockGetTenantConfig(slug);
  }

  const { data } = await axiosInstance.get<BackendTenant[]>('/tenants');
  const tenant = data.find((t) => t.slug === slug && t.isActive);

  if (!tenant) {
    throw new axios.AxiosError(
      'Tenant not found',
      'ERR_NOT_FOUND',
      undefined,
      undefined,
      {
        status: 404,
        statusText: 'Not Found',
        data: { message: 'Tenant not found' },
        headers: {},
        config: {} as never,
      },
    );
  }

  return mapTenantConfig(tenant);
}

export async function getAllTenants(): Promise<TenantListItem[]> {
  if (isMockMode()) {
    return mockGetAllTenants();
  }

  const { data } = await axiosInstance.get<BackendTenant[]>('/tenants');
  return data.filter((t) => t.isActive).map(mapTenantListItem);
}
