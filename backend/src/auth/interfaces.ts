export interface JwtPayload {
  sub: number;
  tenantId: number;
  email: string;
  roles: string[];
}

export interface AuthenticatedUser {
  id: number;
  tenantId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}
