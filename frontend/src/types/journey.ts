export interface JourneyGoalSnapshot {
  goalId: string
  title: string
  progressPercent: number
  completedTasks: number
  totalTasks: number
  lastActivityDate: string | null
  signal: string
}

export interface JourneyTimelineItem {
  date: string
  type: 'PROGRESS' | 'TASK'
  title: string
  detail: string
  goalId: string
}

export interface JourneyOverview {
  periodStart: string
  periodEnd: string
  headline: string
  summary: string
  thisWeekActiveDays: number
  thisWeekCompletedTasks: number
  thisWeekProgressEntries: number
  previousWeekActiveDays: number
  previousWeekCompletedTasks: number
  previousWeekProgressEntries: number
  goals: JourneyGoalSnapshot[]
  timeline: JourneyTimelineItem[]
  reflectionPrompts: string[]
}
