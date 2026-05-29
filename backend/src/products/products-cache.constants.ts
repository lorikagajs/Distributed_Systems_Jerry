import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import type { Request } from 'express';

/** Prefix for GET /products list cache keys (used for invalidation). */
export const PRODUCTS_LIST_CACHE_PREFIX = 'products_list';

export const PRODUCTS_LIST_CACHE_KEY = PRODUCTS_LIST_CACHE_PREFIX;

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(
    context: ExecutionContext,
  ): Promise<string | undefined | null> | string | undefined | null {
    const cacheKey = this.reflector.get(
      'cache_metadata',
      context.getHandler(),
    );
    if (typeof cacheKey === 'function') {
      const key = cacheKey(context);
      return key ?? undefined;
    }
    const key = super.trackBy(context);
    if (key == null) {
      return undefined;
    }
    return key;
  }
}

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

