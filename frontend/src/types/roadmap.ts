export interface RoadmapSkillResponse {
  id: string
  name: string
  description: string | null
  progressPercentage: number | null
  completed: boolean
}
export interface RoadmapMilestoneResponse {
  id: string
  title: string
  description: string | null
  orderIndex: number | null
  estimatedDays: number | null
  tasks: string[]
  completed: boolean
  manualOverride: boolean
}
export interface RoadmapResponse {
  id: string
  goalId: string
  title: string
  description: string | null
  generatedAt: string
  active: boolean
  skills: RoadmapSkillResponse[]
  milestones: RoadmapMilestoneResponse[]
}
export interface SetMilestoneCompletionRequest {
  completed: boolean
}
