import axios from 'axios';

/** Paths that must not receive an automatic tenant slug prefix */
const SKIP_PREPEND_PREFIXES = ['/tenants', '/auth'];

let currentTenantId: number | null = null;
let currentTenantSlug: string | null = null;

export function setTenantId(tenantId: number | null) {
  currentTenantId = tenantId;
}

export function getTenantId() {
  return currentTenantId;
}

export function setTenantSlug(slug: string | null) {
  currentTenantSlug = slug;
}

export function getTenantSlug() {
  return currentTenantSlug;
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const url = config.url ?? '';
  const skipPrepend =
    SKIP_PREPEND_PREFIXES.some((prefix) => url.startsWith(prefix)) ||
    !currentTenantSlug ||
    url.startsWith(`/${currentTenantSlug}/`) ||
    url.startsWith(`${currentTenantSlug}/`);

  if (!skipPrepend && config.url) {
    const cleanUrl = config.url.startsWith('/') ? config.url : `/${config.url}`;
    config.url = `/${currentTenantSlug}${cleanUrl}`;
  }

  return config;
});

export default axiosInstance;
