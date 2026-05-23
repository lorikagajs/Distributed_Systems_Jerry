import { Request } from 'express';

export interface TenantRequest extends Request {
  tenantId: number;
}
