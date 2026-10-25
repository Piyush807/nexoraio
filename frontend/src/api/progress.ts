import { apiClient } from './client'
import { cachedGet, invalidateCache } from './cache'
import type {
  ChatResponse,
  CreateProgressEntryRequest,
  CreateProgressTaskRequest,
  ProgressEntryResponse,
  ProgressTaskResponse,
  StreakResponse,
} from '../types/progress'

export const progressApi = {
  record: async (goalId: string, payload: CreateProgressEntryRequest): Promise<ProgressEntryResponse> => {
    const res = await apiClient.post<ProgressEntryResponse>(`/api/v1/goals/${goalId}/progress`, payload)
    invalidateCache(`progress:list:${goalId}`)
    invalidateCache('memory:')
    invalidateCache(`progress:streak`)
    invalidateCache('intelligence:')
    invalidateCache('journey:')
    return res.data
  },
  list: async (goalId: string): Promise<ProgressEntryResponse[]> => {
    return cachedGet(`progress:list:${goalId}`, async () => {
      const res = await apiClient.get<ProgressEntryResponse[]>(`/api/v1/goals/${goalId}/progress`)
      return res.data
    }, 20_000)
  },
  completeTask: async (goalId: string, payload: CreateProgressTaskRequest): Promise<ProgressTaskResponse> => {
    const res = await apiClient.post<ProgressTaskResponse>(`/api/v1/goals/${goalId}/progress/tasks`, payload)
    invalidateCache(`progress:list:${goalId}`)
    invalidateCache('memory:')
    invalidateCache(`progress:tasks:${goalId}`)
    invalidateCache(`progress:streak`)
    invalidateCache('intelligence:')
    invalidateCache('journey:')
    invalidateCache(`roadmap:${goalId}`)
    return res.data
  },
  completedTasks: async (goalId: string): Promise<ProgressTaskResponse[]> => {
    return cachedGet(`progress:tasks:${goalId}`, async () => {
      const res = await apiClient.get<ProgressTaskResponse[]>(`/api/v1/goals/${goalId}/progress/tasks`)
      return res.data
    }, 20_000)
  },
  dailyCoach: async (goalId: string): Promise<ChatResponse> => {
    return cachedGet(`progress:coach:${goalId}`, async () => {
      const res = await apiClient.get<ChatResponse>(`/api/v1/goals/${goalId}/coach/daily`)
      return res.data
    }, 60_000)
  },
  streak: async (): Promise<StreakResponse> => {
    return cachedGet('progress:streak', async () => {
      const res = await apiClient.get<StreakResponse>('/api/v1/progress/streak')
      return res.data
    }, 30_000)
  },
}
