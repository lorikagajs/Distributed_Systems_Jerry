import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  userId: number;
  email: string;
  role: UserRole;
  tenantId: number;
}

export interface AuthUser {
  userId: number;
  email: string;
  role: UserRole;
  tenantId: number;
}
