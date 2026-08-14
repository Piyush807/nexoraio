import { apiClient } from './client'
import type { RoadmapResponse } from '../types/roadmap'

export const roadmapApi = {
  // POST /api/v1/goals/{goalId}/roadmap
  generate: async (goalId: string): Promise<RoadmapResponse> => {
    const res = await apiClient.post<RoadmapResponse>(`/api/v1/goals/${goalId}/roadmap`)
    return res.data
  },
  // GET /api/v1/goals/{goalId}/roadmap
  getByGoalId: async (goalId: string): Promise<RoadmapResponse> => {
    const res = await apiClient.get<RoadmapResponse>(`/api/v1/goals/${goalId}/roadmap`)
    return res.data
  },
}
