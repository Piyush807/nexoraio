// Matches io.nexora.backend.auth.* DTOs exactly.

export type Role = 'STUDENT' | 'ADMIN'

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
}

export interface MeResponse {
  email: string
  role: Role
  enabled: boolean
}
