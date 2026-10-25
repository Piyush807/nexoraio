import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { goalsApi } from '../api/goals'
import { refreshAccessTokenOnce, registerUnauthorizedHandler, tokenStore } from '../api/client'
import { clearUserCache } from '../api/cache'
import type { LoginRequest, MeResponse, RegisterRequest } from '../types/auth'
import { ApiError } from '../types/common'

interface AuthContextValue {
  user: MeResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginRequest) => Promise<boolean>
  register: (payload: RegisterRequest) => Promise<string>
  logout: () => void
  hasGoals: boolean | null
  refreshGoalState: () => Promise<boolean>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasGoals, setHasGoals] = useState<boolean | null>(null)
  const navigate = useNavigate()

  const refreshGoalState = useCallback(async () => {
    try {
      const goals = await goalsApi.list()
      const has = goals.length > 0
      setHasGoals(has)
      return has
    } catch {
      // Do not block the app if the goal check itself fails. The goals page
      // will surface the actual request error and the user can retry there.
      // A failed preflight should not trap the user behind a loading gate.
      // The destination page will surface the real API error and offer retry.
      setHasGoals(true)
      return true
    }
  }, [])

  const logout = useCallback(() => {
    // Best-effort: revoke the refresh token server-side and clear its cookie.
    // Client state is cleared regardless of whether this call succeeds.
    authApi.logout().catch(() => {})
    tokenStore.clear()
    clearUserCache()
    setUser(null)
    setHasGoals(null)
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clearUserCache()
      setUser(null)
      setHasGoals(null)
      navigate('/login')
    })
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    const cachedUser = (() => {
      try {
        const raw = sessionStorage.getItem('nexora.user-cache.v1')
        return raw ? JSON.parse(raw) as MeResponse : null
      } catch { return null }
    })()
    if (cachedUser && tokenStore.get()) setUser(cachedUser)

    const restore = async () => {
      if (!tokenStore.get()) {
        // No access token in this browser tab/session — but a valid
        // httpOnly refresh cookie may still exist (e.g. localStorage was
        // cleared, or this is a fresh tab). Try a silent refresh before
        // giving up, so the session survives across tabs and reloads.
        try {
          const accessToken = await refreshAccessTokenOnce()
          const res = { accessToken, tokenType: tokenStore.getType() }
          const me = await authApi.me()
          if (cancelled) return
          setUser(me)
          await refreshGoalState()
          try { sessionStorage.setItem('nexora.user-cache.v1', JSON.stringify(me)) } catch { /* optional */ }
        } catch {
          tokenStore.clear()
        } finally {
          setIsLoading(false)
        }
        return
      }
      try {
        const me = await authApi.me()
        if (cancelled) return
        setUser(me)
        await refreshGoalState()
        try { sessionStorage.setItem('nexora.user-cache.v1', JSON.stringify(me)) } catch { /* optional */ }
      } catch {
        tokenStore.clear()
      } finally {
        setIsLoading(false)
      }
    }
    restore()
    return () => { cancelled = true }
  }, [refreshGoalState])

  const login = useCallback(async (payload: LoginRequest) => {
    clearUserCache()
    const res = await authApi.login(payload)
    tokenStore.set(res.accessToken, res.tokenType || 'Bearer')
    const me = await authApi.me()
    setUser(me)
    const hasGoalsAfterLogin = await refreshGoalState()
    try { sessionStorage.setItem('nexora.user-cache.v1', JSON.stringify(me)) } catch { /* optional */ }
    return hasGoalsAfterLogin
  }, [refreshGoalState])

  const register = useCallback(async (payload: RegisterRequest) => {
    try {
      return await authApi.register(payload)
    } catch (err) {
      if (err instanceof ApiError) throw err
      throw err
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout, hasGoals, refreshGoalState }),
    [user, isLoading, login, register, logout, hasGoals, refreshGoalState],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
