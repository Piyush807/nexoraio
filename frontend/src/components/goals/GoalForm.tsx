import { useState, type FormEvent } from 'react'
import type { CreateGoalRequest, CurrentLevel } from '../../types/goal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'

interface GoalFormProps {
  onSubmit: (payload: CreateGoalRequest) => Promise<void>
  onCancel: () => void
}

export function GoalForm({ onSubmit, onCancel }: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>('BEGINNER')
  const [targetDate, setTargetDate] = useState('')
  const [dailyStudyHours, setDailyStudyHours] = useState(2)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
    } catch (err: any) {
      setError(err?.message || 'Could not create the goal. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="goal-title"
        label="Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Become a backend engineer"
      />
      <Textarea
        id="goal-description"
        label="Description (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What does success look like?"
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          id="goal-level"
          label="Current level"
          value={currentLevel}
          onChange={(e) => setCurrentLevel(e.target.value as CurrentLevel)}
        >
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
        <Input
          id="goal-hours"
          label="Daily study hours"
          type="number"
          min={1}
          max={16}
          required
          value={dailyStudyHours}
          onChange={(e) => setDailyStudyHours(Number(e.target.value))}
        />
      </div>
      <Input
        id="goal-target-date"
        label="Target date"
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
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          Create goal
        </Button>
      </div>
    </form>
  )
}
