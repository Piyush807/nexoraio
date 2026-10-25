import { useEffect, useState, type FormEvent } from 'react'
import type { CreateGoalRequest, CurrentLevel } from '../../types/goal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { ApiError } from '../../types/common'

interface GoalFormProps {
  onSubmit: (payload: CreateGoalRequest) => Promise<void>
  onCancel: () => void
  showCancel?: boolean
}

export function GoalForm({ onSubmit, onCancel, showCancel = true }: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>('BEGINNER')
  const [targetDate, setTargetDate] = useState('')
  const [dailyStudyHours, setDailyStudyHours] = useState(2)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const DRAFT_KEY = 'nexora.goal-draft.v1'

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null')
      if (saved) {
        setTitle(saved.title || '')
        setDescription(saved.description || '')
        setCurrentLevel(saved.currentLevel || 'BEGINNER')
        setTargetDate(saved.targetDate || '')
        setDailyStudyHours(Number(saved.dailyStudyHours) || 2)
      }
    } catch { /* draft recovery is optional */ }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ title, description, currentLevel, targetDate, dailyStudyHours }))
    } catch { /* storage is optional */ }
  }, [title, description, currentLevel, targetDate, dailyStudyHours])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim()) {
      setError('Give your goal a title.')
      return
    }
    if (!targetDate) {
      setError('Pick a target date.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        currentLevel,
        targetDate,
        dailyStudyHours,
      })
      try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* optional */ }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the goal. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="goal-title"
        label="What do you want to achieve?"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Become a backend engineer"
      />
      <Textarea
        id="goal-description"
        label="What does success look like? (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add context that would help Nexora understand the outcome."
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          id="goal-level"
          label="Where are you starting?"
          value={currentLevel}
          onChange={(e) => setCurrentLevel(e.target.value as CurrentLevel)}
        >
          <option value="BEGINNER">Beginner — starting fresh</option>
          <option value="INTERMEDIATE">Intermediate — some experience</option>
          <option value="ADVANCED">Advanced — already confident</option>
        </Select>
        <Input
          id="goal-hours"
          label="Daily time (hours)"
          type="number"
          min={1}
          max={24}
          required
          value={dailyStudyHours}
          onChange={(e) => setDailyStudyHours(Number(e.target.value))}
        />
      </div>
      <Input
        id="goal-target-date"
        label="When do you want to reach it?"
        type="date"
        required
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
      />
      {error && (
        <p role="alert" className="rounded-md border border-signal-rose/30 bg-signal-rose/10 px-3 py-2 text-xs text-signal-rose">
          {error}
        </p>
      )}
      <div className="mt-1 flex justify-end gap-2">
        {showCancel && <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>}
        <Button type="submit" isLoading={submitting}>
          Create goal
        </Button>
      </div>
    </form>
  )
}
