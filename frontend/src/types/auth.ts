export type Role = 'STUDENT' | 'ADMIN'

export interface RegisterRequest { email: string; password: string }
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { accessToken: string; tokenType: string }
export type RefreshResponse = LoginResponse
export interface MeResponse { email: string; role: Role; enabled: boolean }

// PATCH /api/v1/auth/password
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
