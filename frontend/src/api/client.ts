import axios, { AxiosError } from 'axios'
import { ApiError } from '../types/common'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const TOKEN_KEY = 'nexora.accessToken'
const TOKEN_TYPE_KEY = 'nexora.tokenType'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  getType: () => localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer',
  set: (token: string, tokenType: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_TYPE_KEY)
  },
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `${tokenStore.getType()} ${token}`
  }
  return config
})

// Fired when a 401 comes back so the app can redirect to /login.
type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null
export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status
    const backendMessage: string | undefined =
      error.response?.data?.message || error.response?.data?.error

    if (status === 401) {
      tokenStore.clear()
      onUnauthorized?.()
    }

    if (!error.response) {
      return Promise.reject(
        new ApiError({
          message: 'Could not reach the Nexora server. Check your connection or try again.',
        }),
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
    case 400:
      return 'That request was not valid. Check the fields and try again.'
    case 401:
      return 'Your session has expired. Sign in again.'
    case 403:
      return "You don't have access to that."
    case 404:
      return "That couldn't be found."
    case 409:
      return 'That already exists.'
    case 500:
    case 502:
    case 503:
      return 'Something went wrong on our end. Try again shortly.'
    default:
      return 'Something went wrong. Try again.'
  }
}
