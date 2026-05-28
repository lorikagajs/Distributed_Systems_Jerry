import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TenantsService } from './tenants.service';

/** Paths that never use a leading /:slug segment */
const SKIP_PREFIXES = new Set(['api', 'auth', 'tenants', 'health']);

/**
 * API roots served at /products, /categories, etc. with ?tenantId=.
 * These must not be treated as tenant slugs.
 */
const API_RESOURCE_PREFIXES = new Set([
  'products',
  'categories',
  'cart',
  'orders',
  'users',
  'reviews',
  'coupons',
  'wishlist',
]);

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const path = req.path ?? req.url.split('?')[0];
    const segments = path.split('/').filter(Boolean);
    const firstSegment = segments[0];

    if (
      !firstSegment ||
      SKIP_PREFIXES.has(firstSegment) ||
      API_RESOURCE_PREFIXES.has(firstSegment)
    ) {
      return next();
    }

    const tenant = await this.tenantsService.findBySlug(firstSegment);

    if (!tenant || !tenant.isActive) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Tenant not found',
        error: 'Not Found',
      });
    }

    req['tenant'] = tenant;
    req['tenantScoped'] = true;

    const strippedPath = '/' + segments.slice(1).join('/');
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex >= 0 ? req.url.slice(queryIndex) : '';
    req.url = (strippedPath === '/' ? '' : strippedPath) + query;

    next();
  }
}
