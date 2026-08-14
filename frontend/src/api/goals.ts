import { apiClient } from './client'
import type { CreateGoalRequest, GoalResponse, UpdateGoalRequest } from '../types/goal'

export const goalsApi = {
  create: async (payload: CreateGoalRequest): Promise<GoalResponse> => {
    const res = await apiClient.post<GoalResponse>('/api/v1/goals', payload)
    return res.data
  },
  list: async (): Promise<GoalResponse[]> => {
    const res = await apiClient.get<GoalResponse[]>('/api/v1/goals')
    return res.data
  },
  getById: async (goalId: string): Promise<GoalResponse> => {
    const res = await apiClient.get<GoalResponse>(`/api/v1/goals/${goalId}`)
    return res.data
  },
  update: async (goalId: string, payload: UpdateGoalRequest): Promise<GoalResponse> => {
    const res = await apiClient.put<GoalResponse>(`/api/v1/goals/${goalId}`, payload)
    return res.data
  },
  remove: async (goalId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/goals/${goalId}`)
  },
}
