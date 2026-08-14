import { apiClient } from './client'
import type {
  ChatResponse,
  CreateProgressEntryRequest,
  CreateProgressTaskRequest,
  ProgressEntryResponse,
  ProgressTaskResponse,
} from '../types/progress'

export const progressApi = {
  record: async (goalId: string, payload: CreateProgressEntryRequest): Promise<ProgressEntryResponse> => {
    const res = await apiClient.post<ProgressEntryResponse>(`/api/v1/goals/${goalId}/progress`, payload)
    return res.data
  },
  list: async (goalId: string): Promise<ProgressEntryResponse[]> => {
    const res = await apiClient.get<ProgressEntryResponse[]>(`/api/v1/goals/${goalId}/progress`)
    return res.data
  },
  completeTask: async (goalId: string, payload: CreateProgressTaskRequest): Promise<ProgressTaskResponse> => {
    const res = await apiClient.post<ProgressTaskResponse>(`/api/v1/goals/${goalId}/progress/tasks`, payload)
    return res.data
  },
  completedTasks: async (goalId: string): Promise<ProgressTaskResponse[]> => {
    const res = await apiClient.get<ProgressTaskResponse[]>(`/api/v1/goals/${goalId}/progress/tasks`)
    return res.data
  },
  dailyCoach: async (goalId: string): Promise<ChatResponse> => {
    const res = await apiClient.get<ChatResponse>(`/api/v1/goals/${goalId}/coach/daily`)
    return res.data
  },
}
