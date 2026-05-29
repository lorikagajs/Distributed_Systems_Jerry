import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getAuthMe } from '../api/auth';
import { decodeJwtPayload } from '../utils/jwt';
import { isAdminRole } from '../constants/roles';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  authLoading: boolean;
  login: (data: { token: string; user?: User | null }) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  );
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('token')));

  const login = (data: { token: string; user?: User | null }) => {
    setUser(data.user ?? null);
    setToken(data.token);
    localStorage.setItem('token', data.token);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => logout();
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [logout]);

  useEffect(() => {
    if (!token || user) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    setAuthLoading(true);

    getAuthMe()
      .then((me) => {
        if (cancelled) return;
        setUser({
          id: me.id,
          name: me.name ?? me.email.split('@')[0],
          email: me.email,
          role: me.role,
          tenantId: me.tenantId,
        });
      })
      .catch(() => {
        if (cancelled) return;
        const claims = decodeJwtPayload(token);
        if (
          claims?.sub != null &&
          claims.role &&
          claims.tenantId != null
        ) {
          setUser({
            id: claims.userId ?? claims.sub,
            name: claims.email?.split('@')[0] ?? 'User',
            email: claims.email ?? '',
            role: claims.role,
            tenantId: claims.tenantId,
          });
          return;
        }
        logout();
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, user, logout]);

  const isAdmin = useMemo(() => isAdminRole(user?.role), [user?.role]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAdmin, authLoading, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};