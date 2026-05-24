import axios from 'axios';

/** Paths that must not receive an automatic tenantId query param */
const SKIP_TENANT_QUERY_PREFIXES = ['/tenants', '/auth'];

let currentTenantId: number | null = null;

export function setTenantId(tenantId: number | null) {
  currentTenantId = tenantId;
}

export function getTenantId() {
  return currentTenantId;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
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

export default axiosInstance;
