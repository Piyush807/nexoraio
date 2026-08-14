// Matches io.nexora.backend.goal.* DTOs exactly.

export type CurrentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type GoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'

export interface CreateGoalRequest {
  title: string
  description?: string
  currentLevel: CurrentLevel
  targetDate: string // LocalDate -> "YYYY-MM-DD"
  dailyStudyHours: number
}

export interface UpdateGoalRequest {
  title?: string
  description?: string
  currentLevel?: CurrentLevel
  status?: GoalStatus
  targetDate?: string
  dailyStudyHours?: number
}

export interface GoalResponse {
  id: string
  title: string
  description: string | null
  currentLevel: CurrentLevel
  status: GoalStatus
  targetDate: string
  dailyStudyHours: number
  createdAt: string
  updatedAt: string
}
