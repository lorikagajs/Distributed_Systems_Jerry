import axios from 'axios';
import { getApiBaseUrl } from '../config/env';

/** Paths that must not receive an automatic tenantId query param */
const SKIP_TENANT_QUERY_PREFIXES = [
  '/tenants',
  '/auth',
  '/cart',
  '/orders',
  '/users',
  '/wishlist',
];

let currentTenantId: number | null = null;

export function setTenantId(tenantId: number | null) {
  currentTenantId = tenantId;
}

export function getTenantId() {
  return currentTenantId;
}

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const url = config.url ?? '';
  const skipTenant =
    SKIP_TENANT_QUERY_PREFIXES.some((prefix) => url.startsWith(prefix)) ||
    currentTenantId == null;

  if (!skipTenant) {
    config.params = {
      ...(config.params as Record<string, unknown>),
      tenantId: currentTenantId,
    };
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      const isAuthRoute =
        url.startsWith('/auth/login') || url.startsWith('/auth/register');
      if (!isAuthRoute && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
