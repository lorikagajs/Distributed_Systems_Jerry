export interface JwtUserClaims {
  sub?: number;
  userId?: number;
  email?: string;
  role?: string;
  tenantId?: number;
}

/** Decode JWT payload without verification (client-side routing only). */
export function decodeJwtPayload(token: string): JwtUserClaims | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtUserClaims;
  } catch {
    return null;
  }
}
