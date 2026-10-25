import { apiClient } from './client'
import { cachedGet, invalidateCache } from './cache'
import type { CreateGoalRequest, GoalResponse, UpdateGoalRequest } from '../types/goal'

export const goalsApi = {
  create: async (payload: CreateGoalRequest): Promise<GoalResponse> => {
    const res = await apiClient.post<GoalResponse>('/api/v1/goals', payload)
    invalidateCache('goals:')
    invalidateCache('memory:')
    invalidateCache('intelligence:')
    invalidateCache('journey:')
    return res.data
  },
  list: async (): Promise<GoalResponse[]> => {
    return cachedGet('goals:list', async () => {
      const res = await apiClient.get<GoalResponse[]>('/api/v1/goals')
      return res.data
    }, 45_000)
  },
  getById: async (goalId: string): Promise<GoalResponse> => {
    return cachedGet(`goals:${goalId}`, async () => {
      const res = await apiClient.get<GoalResponse>(`/api/v1/goals/${goalId}`)
      return res.data
    }, 45_000)
  },
  update: async (goalId: string, payload: UpdateGoalRequest): Promise<GoalResponse> => {
    const res = await apiClient.put<GoalResponse>(`/api/v1/goals/${goalId}`, payload)
    invalidateCache('goals:')
    invalidateCache('memory:')
    invalidateCache('intelligence:')
    invalidateCache('journey:')
    return res.data
  },
  remove: async (goalId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/goals/${goalId}`)
    invalidateCache('goals:')
    invalidateCache('memory:')
    invalidateCache('intelligence:')
    invalidateCache('journey:')
  },
}
