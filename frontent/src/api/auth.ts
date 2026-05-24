import axiosInstance from "./axiosInstance";
export interface AuthResponse { token: string; user: { id: string; name: string; email: string; avatar?: string }; }
export async function loginUser(email: string, password: string): Promise<AuthResponse> { const r = await axiosInstance.post<AuthResponse>("/auth/login", { email, password }); return r.data; }
export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> { const r = await axiosInstance.post<AuthResponse>("/auth/register", { name, email, password }); return r.data; }
