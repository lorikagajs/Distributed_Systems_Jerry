import { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** Prefix for GET /products list cache keys (used for invalidation). */
export const PRODUCTS_LIST_CACHE_PREFIX = 'products_list';

export const PRODUCTS_LIST_CACHE_KEY = PRODUCTS_LIST_CACHE_PREFIX;

export function buildProductsListCacheKey(
  ctx: ExecutionContext,
): string | undefined {
  const req = ctx.switchToHttp().getRequest<Request>();
  const tenantId = req.tenant?.id ?? parseTenantIdFromQuery(req.query.tenantId);
  if (!tenantId) {
    return undefined;
  }

  const { tenantId: _tenantId, ...filters } = req.query;
  const filterKey = Object.keys(filters)
    .sort()
    .map((key) => `${key}=${String(filters[key])}`)
    .join('&');

  return filterKey
    ? `${PRODUCTS_LIST_CACHE_PREFIX}:${tenantId}:${filterKey}`
    : `${PRODUCTS_LIST_CACHE_PREFIX}:${tenantId}`;
}

function parseTenantIdFromQuery(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const id = Number(value);
  return Number.isFinite(id) ? id : undefined;
}
