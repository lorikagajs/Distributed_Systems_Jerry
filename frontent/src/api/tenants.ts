import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';
import { mockGetAllTenants, mockGetTenantConfig } from '../mocks/mockApi';

export interface TenantConfig {
  id: number;
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
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  bannerUrl: string | null;
  storeName: string | null;
  storeDescription: string | null;
}

const DEFAULT_PRIMARY = '#4f46e5';
const DEFAULT_SECONDARY = '#7c3aed';

function mapTenantConfig(tenant: BackendTenant): TenantConfig {
  return {
    id: tenant.id,
    tenantId: tenant.id,
    slug: tenant.slug,
    storeName: tenant.storeName || tenant.name,
    logoUrl: tenant.logoUrl,
    primaryColor: tenant.primaryColor ?? DEFAULT_PRIMARY,
    secondaryColor: tenant.secondaryColor ?? DEFAULT_SECONDARY,
    bannerUrl: tenant.bannerUrl,
    storeDescription: tenant.storeDescription,
  };
}

function mapTenantListItem(t: BackendTenant): TenantListItem {
  return {
    slug: t.slug,
    storeName: t.storeName || t.name,
    storeDescription: t.storeDescription,
    primaryColor: t.primaryColor ?? DEFAULT_PRIMARY,
    secondaryColor: t.secondaryColor ?? DEFAULT_SECONDARY,
    bannerUrl: t.bannerUrl,
  };
}

export async function getTenantConfig(slug: string): Promise<TenantConfig> {
  if (isMockMode()) {
    const config = await mockGetTenantConfig(slug);
    return {
      ...config,
      id: config.tenantId, // Add id to mock configuration object
    };
  }

  const { data } = await axiosInstance.get<BackendTenant>(`/tenants/${slug}/config`);
  return mapTenantConfig(data);
}

export async function getAllTenants(): Promise<TenantListItem[]> {
  if (isMockMode()) {
    return mockGetAllTenants();
  }

  const { data } = await axiosInstance.get<BackendTenant[]>('/tenants');
  return data.filter((t) => t.isActive).map(mapTenantListItem);
}
