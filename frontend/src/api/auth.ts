import { apiClient } from './client'
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest } from '../types/auth'

export const authApi = {
  // POST /api/v1/auth/register -> 201, plain-text body (registration message)
  register: async (payload: RegisterRequest): Promise<string> => {
    const res = await apiClient.post<string>('/api/v1/auth/register', payload, {
      transformResponse: [(data) => data],
    })
    return res.data
  },

  // POST /api/v1/auth/login -> LoginResponse
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', payload)
    return res.data
  },

  // GET /api/v1/auth/me -> MeResponse
  me: async (): Promise<MeResponse> => {
    const res = await apiClient.get<MeResponse>('/api/v1/auth/me')
    return res.data
  },
}
