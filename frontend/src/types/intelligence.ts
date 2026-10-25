export interface DailyIntelligenceResponse {
  date: string
  focusGoalId: string | null
  focusGoalTitle: string | null
  headline: string
  reason: string
  nextAction: string
  milestoneTitle: string | null
  completedTasks: number
  totalTasks: number
  progressPercent: number
  inactiveDays: number
  needsRestart: boolean
  roadmapAvailable: boolean
}

export type CoachMode = 'EXPLAIN' | 'PLAN' | 'UNSTUCK' | 'REFLECT' | 'RESTART'

export interface CoachResponse {
  mode: CoachMode
  title: string
  response: string
  microAction: string
  whyNow: string
}
