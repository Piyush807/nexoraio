import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ApiError } from '../types/common'
import type { LoginResponse } from '../types/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
let accessToken: string | null = null
let accessTokenType = 'Bearer'

export const tokenStore = {
  get: () => accessToken,
  getType: () => accessTokenType,
  set: (token: string, tokenType: string) => { accessToken = token; accessTokenType = tokenType || 'Bearer' },
  clear: () => { accessToken = null; accessTokenType = 'Bearer' },
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `${tokenStore.getType()} ${token}`
  }
  return config
})

type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null
export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler
}

let refreshInFlight: Promise<string> | null = null

export function refreshAccessTokenOnce(): Promise<string> {
  if (refreshInFlight) return refreshInFlight

  const request: Promise<string> = axios.post<LoginResponse>(
    `${BASE_URL}/api/v1/auth/refresh`,
    null,
    { withCredentials: true },
  ).then((res) => {
    tokenStore.set(res.data.accessToken, res.data.tokenType || 'Bearer')
    return res.data.accessToken
  })
  refreshInFlight = request.finally(() => { refreshInFlight = null })
  return request
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status
    const originalRequest = error.config as RetryableConfig | undefined
    const isAuthEndpoint = originalRequest?.url?.includes('/api/v1/auth/')

    if (status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true
      try {
        const newToken = await refreshAccessTokenOnce()
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `${tokenStore.getType()} ${newToken}`
        return apiClient(originalRequest)
      } catch {
        tokenStore.clear()
        onUnauthorized?.()
        return Promise.reject(
          new ApiError({ status: 401, message: 'Your session has expired. Sign in again.' }),
        )
      }
    }

    if (status === 401) {
      tokenStore.clear()
      onUnauthorized?.()
    }

    const backendMessage: string | undefined =
      error.response?.data?.message || error.response?.data?.error

    if (!error.response) {
      return Promise.reject(
        new ApiError({ message: 'Could not reach the Nexora server. Check your connection or try again.' }),
      )
    }

    return Promise.reject(
      new ApiError({
        status,
        message: backendMessage || fallbackMessageFor(status),
        details: typeof error.response?.data === 'string' ? error.response.data : undefined,
      }),
    )
  },
)

function fallbackMessageFor(status?: number): string {
  switch (status) {
    case 400: return 'That request was not valid. Check the fields and try again.'
    case 401: return 'Your session has expired. Sign in again.'
    case 403: return "You don't have access to that."
    case 404: return "That couldn't be found."
    case 409: return 'That already exists.'
    case 500:
    case 502:
    case 503: return 'Something went wrong on our end. Try again shortly.'
    default: return 'Something went wrong. Try again.'
  }
}
