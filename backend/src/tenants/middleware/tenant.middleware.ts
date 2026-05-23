import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { TenantRequest } from '../interfaces/tenant-request.interface';

interface TenantJwtPayload {
  tenantId?: unknown;
  tenant_id?: unknown;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    req.tenantId = this.extractTenantId(req);
    next();
  }

  private extractTenantId(req: TenantRequest): number {
    const authorization = req.headers.authorization;

    if (authorization) {
      return this.extractTenantIdFromAuthorization(authorization);
    }

    const tenantHeader = req.headers['x-tenant-id'];

    if (tenantHeader === undefined) {
      throw new UnauthorizedException('Tenant context is required');
    }

    return this.parseTenantId(tenantHeader);
  }

  private extractTenantIdFromAuthorization(authorization: string): number {
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    const payload = this.decodeJwtPayload(token);
    return this.parseTenantId(payload.tenantId ?? payload.tenant_id);
  }

  private decodeJwtPayload(token: string): TenantJwtPayload {
    const [, payload] = token.split('.');

    if (!payload) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddingLength = (4 - (normalizedPayload.length % 4)) % 4;
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + paddingLength,
        '=',
      );

      const decodedPayload = Buffer.from(paddedPayload, 'base64').toString(
        'utf8',
      );
      const parsedPayload: unknown = JSON.parse(decodedPayload);

      if (!this.isTenantJwtPayload(parsedPayload)) {
        throw new UnauthorizedException('Invalid bearer token');
      }

      return parsedPayload;
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }
  }

  private isTenantJwtPayload(value: unknown): value is TenantJwtPayload {
    return Boolean(value) && typeof value === 'object';
  }

  private parseTenantId(value: unknown): number {
    if (Array.isArray(value)) {
      const [firstValue] = value as unknown[];
      return this.parseTenantId(firstValue);
    }

    const tenantId = value;

    if (typeof tenantId === 'number' && Number.isInteger(tenantId)) {
      if (tenantId > 0) {
        return tenantId;
      }

      throw new BadRequestException(
        'Tenant context must be a positive integer',
      );
    }

    if (typeof tenantId === 'string' && /^[1-9]\d*$/.test(tenantId.trim())) {
      return Number(tenantId);
    }

    throw new BadRequestException('Tenant context must be a positive integer');
  }
}
