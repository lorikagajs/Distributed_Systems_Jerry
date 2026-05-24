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
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  bannerUrl: string | null;
}

interface BackendTenantListItem {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  storeName?: string | null;
  storeDescription?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  bannerUrl?: string | null;
}

interface BackendTenantConfig {
  id: number;
  slug: string;
  storeName?: string | null;
  storeDescription?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  bannerUrl?: string | null;
}

const DEFAULT_PRIMARY = '#4f46e5';
const DEFAULT_SECONDARY = '#7c3aed';

function mapTenantConfig(tenant: BackendTenantConfig): TenantConfig {
  return {
    tenantId: tenant.id,
    slug: tenant.slug,
    storeName: tenant.storeName ?? tenant.slug,
    logoUrl: tenant.logoUrl ?? null,
    primaryColor: tenant.primaryColor ?? DEFAULT_PRIMARY,
    secondaryColor: tenant.secondaryColor ?? DEFAULT_SECONDARY,
    bannerUrl: tenant.bannerUrl ?? null,
    storeDescription: tenant.storeDescription ?? null,
  };
}

function mapTenantListItem(t: BackendTenantListItem): TenantListItem {
  return {
    slug: t.slug,
    storeName: t.storeName ?? t.name,
    storeDescription: t.storeDescription ?? null,
    logoUrl: t.logoUrl ?? null,
    primaryColor: t.primaryColor ?? DEFAULT_PRIMARY,
    secondaryColor: t.secondaryColor ?? DEFAULT_SECONDARY,
    bannerUrl: t.bannerUrl ?? null,
  };
}

export async function getTenantConfig(slug: string): Promise<TenantConfig> {
  if (isMockMode()) {
    return mockGetTenantConfig(slug);
  }

  try {
    const { data } = await axiosInstance.get<BackendTenantConfig>(
      `/tenants/${encodeURIComponent(slug)}/config`,
    );
    return mapTenantConfig(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw error;
    }
    throw error;
  }
}

export async function getAllTenants(): Promise<TenantListItem[]> {
  if (isMockMode()) {
    return mockGetAllTenants();
  }

  const { data } = await axiosInstance.get<BackendTenantListItem[]>('/tenants');
  return data.filter((t) => t.isActive).map(mapTenantListItem);
}
