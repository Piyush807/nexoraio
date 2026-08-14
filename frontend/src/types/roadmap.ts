// Matches io.nexora.backend.roadmap.dto.response.* DTOs exactly.
// The backend currently exposes only:
//   POST /api/v1/goals/{goalId}/roadmap   -> generate
//   GET  /api/v1/goals/{goalId}/roadmap   -> fetch
// There is no milestone/skill mutation endpoint yet, so "completed"
// is display-only until the backend adds that mutation.

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
