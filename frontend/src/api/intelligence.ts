import { apiClient } from './client'
import { cachedGet, invalidateCache } from './cache'
import type { CoachMode, CoachResponse, DailyIntelligenceResponse } from '../types/intelligence'

const KEY = 'intelligence:today'

export const intelligenceApi = {
  today: async (): Promise<DailyIntelligenceResponse> => {
    return cachedGet(KEY, async () => {
      const res = await apiClient.get<DailyIntelligenceResponse>('/api/v1/intelligence/today')
      return res.data
    }, 15_000)
  },
  coach: async (goalId: string, mode: CoachMode): Promise<CoachResponse> => {
    const res = await apiClient.post<CoachResponse>(`/api/v1/goals/${goalId}/intelligence/coach`, { mode })
    return res.data
  },
  invalidate: () => invalidateCache('intelligence:'),
}
