import { apiClient } from './client'
import { cachedGet, invalidateCache } from './cache'
import type { GrowthMemoryResponse } from '../types/memory'

export const memoryApi = {
  get: async (): Promise<GrowthMemoryResponse> => {
    return cachedGet('memory:journey', async () => {
      const res = await apiClient.get<GrowthMemoryResponse>('/api/v1/memory')
      return res.data
    }, 30_000)
  },
  refresh: async (): Promise<GrowthMemoryResponse> => {
    const res = await apiClient.post<GrowthMemoryResponse>('/api/v1/memory/refresh')
    invalidateCache('memory:')
    return res.data
  },
}
