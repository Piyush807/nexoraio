import { apiClient } from './client'
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  RegisterRequest,
} from '../types/auth'

export const authApi = {
  register: async (payload: RegisterRequest): Promise<string> => {
    const res = await apiClient.post<string>('/api/v1/auth/register', payload, {
      transformResponse: [(data: unknown) => data],
    })
    return res.data
  },
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', payload)
    return res.data
  },
  refresh: async (): Promise<RefreshResponse> => {
    const res = await apiClient.post<RefreshResponse>('/api/v1/auth/refresh')
    return res.data
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout')
  },
  me: async (): Promise<MeResponse> => {
    const res = await apiClient.get<MeResponse>('/api/v1/auth/me')
    return res.data
  },
  // On success the backend also revokes every other refresh-token
  // session for this account — other logged-in devices/browsers will
  // need to log in again next time their access token expires.
  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await apiClient.patch('/api/v1/auth/password', payload)
  },
}
