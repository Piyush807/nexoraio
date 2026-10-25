export interface CreateProgressEntryRequest {
  entryDate: string
  note?: string
  completedMilestones?: number
  completedTasks?: number
  growthScore?: number
}
export interface ProgressEntryResponse {
  id: string
  goalId: string
  roadmapId: string
  entryDate: string
  note: string | null
  completedMilestones: number | null
  completedTasks: number | null
  growthScore: number | null
  createdAt: string
  updatedAt: string
}
export interface CreateProgressTaskRequest { milestoneTitle: string; taskTitle: string }
export interface ProgressTaskResponse {
  id: string
  goalId: string
  roadmapId: string
  milestoneTitle: string
  taskTitle: string
  completed: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}
export interface ChatResponse { reply: string }

// GET /api/v1/progress/streak (account-scoped, not goal-scoped)
export interface StreakResponse {
  currentStreakDays: number
  longestStreakDays: number
  lastEntryDate: string | null
}
