import axios from 'axios';
import axiosInstance from './axiosInstance';

export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
  role: string;
  tenantId: number;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user?: AuthUser;
}

export interface RegisterResponse {
  user: AuthUser;
}

export async function loginUser(
  email: string,
  password: string,
  tenantId?: number,
): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/auth/login', {
    email,
    password,
    tenantId,
  });
  return data;
}

export async function getAuthMe(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<AuthUser>('/auth/me');
  return data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  tenantId: number,
): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>(
    '/auth/register',
    {
      name: name.trim(),
      email,
      password,
      tenantId,
    },
  );
  return data;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  if (typeof message === 'string') {
    return message;
  }

  return fallback;
}
