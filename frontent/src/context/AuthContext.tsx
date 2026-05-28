import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getMyProfile } from '../api/users';
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

    getMyProfile()
      .then((profile) => {
        if (cancelled) return;
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          tenantId: profile.tenantId,
        });
      })
      .catch(() => {
        if (!cancelled) logout();
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