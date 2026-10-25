import { apiClient } from './client'
import { cachedGet, invalidateCache } from './cache'
import type { RoadmapMilestoneResponse, RoadmapResponse, SetMilestoneCompletionRequest } from '../types/roadmap'

export const roadmapApi = {
  generate: async (goalId: string): Promise<RoadmapResponse> => {
    const res = await apiClient.post<RoadmapResponse>(`/api/v1/goals/${goalId}/roadmap`)
    invalidateCache(`roadmap:${goalId}`)
    invalidateCache('intelligence:')
    invalidateCache('journey:')
    return res.data
  },
  regenerate: async (goalId: string): Promise<RoadmapResponse> => {
    const res = await apiClient.post<RoadmapResponse>(`/api/v1/goals/${goalId}/roadmap/regenerate`)
    invalidateCache(`roadmap:${goalId}`)
    invalidateCache('intelligence:')
    invalidateCache('journey:')
    return res.data
  },
  getByGoalId: async (goalId: string): Promise<RoadmapResponse> => {
    return cachedGet(`roadmap:${goalId}`, async () => {
      const res = await apiClient.get<RoadmapResponse>(`/api/v1/goals/${goalId}/roadmap`)
      return res.data
    }, 60_000)
  },
  setMilestoneCompletion: async (
    goalId: string,
    milestoneId: string,
    completed: boolean,
  ): Promise<RoadmapMilestoneResponse> => {
    const payload: SetMilestoneCompletionRequest = { completed }
    const res = await apiClient.patch<RoadmapMilestoneResponse>(
      `/api/v1/goals/${goalId}/roadmap/milestones/${milestoneId}`,
      payload,
    )
    invalidateCache(`roadmap:${goalId}`)
    invalidateCache('intelligence:')
    invalidateCache('journey:')
    return res.data
  },
}
