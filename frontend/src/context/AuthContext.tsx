import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { registerUnauthorizedHandler, tokenStore } from '../api/client'
import type { LoginRequest, MeResponse, RegisterRequest } from '../types/auth'
import { ApiError } from '../types/common'

interface AuthContextValue {
  user: MeResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<string>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null)
      navigate('/login')
    })
  }, [navigate])

  useEffect(() => {
    const restore = async () => {
      if (!tokenStore.get()) {
        setIsLoading(false)
        return
      }
      try {
        const me = await authApi.me()
        setUser(me)
      } catch {
        tokenStore.clear()
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const login = useCallback(async (payload: LoginRequest) => {
    const res = await authApi.login(payload)
    tokenStore.set(res.accessToken, res.tokenType || 'Bearer')
    const me = await authApi.me()
    setUser(me)
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    try {
      return await authApi.register(payload)
    } catch (err) {
      if (err instanceof ApiError) throw err
      throw err
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
