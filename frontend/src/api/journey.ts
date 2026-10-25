import { cachedGet } from './cache'
import { apiClient } from './client'
import type { JourneyOverview } from '../types/journey'

export const journeyApi = {
  overview: async (): Promise<JourneyOverview> => cachedGet('journey:overview', async () => {
    const res = await apiClient.get<JourneyOverview>('/api/v1/journey/overview')
    return res.data
  }, 30_000),
}
