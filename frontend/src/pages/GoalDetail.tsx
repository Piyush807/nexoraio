import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { goalsApi } from '../api/goals'
import { roadmapApi } from '../api/roadmap'
import { progressApi } from '../api/progress'
import type { GoalResponse, UpdateGoalRequest } from '../types/goal'
import type { RoadmapResponse } from '../types/roadmap'
import type { ProgressEntryResponse } from '../types/progress'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input, Select, Textarea } from '../components/ui/Input'
import { LoadingState } from '../components/ui/LoadingState'
import { ErrorState } from '../components/ui/ErrorState'
import { useToast } from '../components/ui/Toast'
import { ApiError } from '../types/common'
import { formatDate, daysUntil } from '../utils/formatDate'

export default function GoalDetail() {
  const { goalId } = useParams<{ goalId: string }>()
  const navigate = useNavigate()
  const { push } = useToast()

  const [goal, setGoal] = useState<GoalResponse | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)
  const [roadmapChecked, setRoadmapChecked] = useState(false)
  const [entries, setEntries] = useState<ProgressEntryResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    if (!goalId) return
    setError(null)
    try {
      const g = await goalsApi.getById(goalId)
      setGoal(g)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this goal.')
      return
    }
    try {
      const r = await roadmapApi.getByGoalId(goalId)
      setRoadmap(r)
    } catch {
      setRoadmap(null)
    } finally {
      setRoadmapChecked(true)
    }
    progressApi.list(goalId).then(setEntries).catch(() => setEntries([]))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!goal) return <LoadingState label="Loading goal…" />

  const remaining = daysUntil(goal.targetDate)

  const handleUpdate = async (payload: UpdateGoalRequest) => {
    if (!goalId) return
    const updated = await goalsApi.update(goalId, payload)
    setGoal(updated)
    setEditOpen(false)
    push('Goal updated.', 'success')
  }

  const handleDelete = async () => {
    if (!goalId) return
    if (!confirm('Delete this goal? This cannot be undone.')) return
    setDeleting(true)
    try {
      await goalsApi.remove(goalId)
      push('Goal deleted.', 'success')
      navigate('/goals')
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not delete the goal.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleLogProgress = async (payload: { entryDate: string; note?: string; growthScore?: number }) => {
    if (!goalId) return
    const entry = await progressApi.record(goalId, payload)
    setEntries((prev) => [entry, ...prev])
    setLogOpen(false)
    push('Progress logged.', 'success')
  }

  return (
    <div>
      <Link to="/goals" className="text-sm text-ink-500 hover:text-ink-100">
        ← All goals
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-ink-100">{goal.title}</h1>
            <Badge tone={goal.status === 'ACTIVE' ? 'mint' : goal.status === 'COMPLETED' ? 'violet' : goal.status === 'PAUSED' ? 'amber' : 'rose'}>
              {goal.status}
            </Badge>
          </div>
          {goal.description && <p className="mt-2 max-w-xl text-sm text-ink-500">{goal.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} isLoading={deleting}>
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Meta label="Level" value={goal.currentLevel} />
        <Meta label="Daily hours" value={`${goal.dailyStudyHours}h`} />
        <Meta label="Target date" value={formatDate(goal.targetDate)} />
        <Meta label="Time left" value={remaining === null ? '—' : remaining >= 0 ? `${remaining}d` : 'Past due'} />
      </div>

      {/* Roadmap */}
      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-ink-100">Roadmap</h2>
          {roadmap && (
            <Link to={`/goals/${goal.id}/roadmap`} className="text-sm text-signal-violetSoft hover:underline">
              View roadmap →
            </Link>
          )}
        </div>
        {!roadmapChecked && <p className="mt-2 text-sm text-ink-500">Checking for an existing roadmap…</p>}
        {roadmapChecked && roadmap && (
          <p className="mt-2 text-sm text-ink-500">
            "{roadmap.title}" — {roadmap.milestones.length} milestones · {roadmap.skills.length} skills
          </p>
        )}
        {roadmapChecked && !roadmap && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-500">No roadmap generated yet for this goal.</p>
            <Link to={`/goals/${goal.id}/roadmap`}>
              <Button size="sm">Generate roadmap</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Progress */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-ink-100">Progress log</h2>
          <Button size="sm" variant="secondary" onClick={() => setLogOpen(true)}>
            + Log entry
          </Button>
        </div>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No progress entries yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {entries.map((e) => (
              <li key={e.id} className="rounded-lg border border-base-700 bg-base-950/40 p-3.5">
                <div className="flex items-center justify-between text-xs font-mono text-ink-700">
                  <span>{formatDate(e.entryDate)}</span>
                  {e.growthScore !== null && <span>Growth score: {e.growthScore}</span>}
                </div>
                {e.note && <p className="mt-1.5 text-sm text-ink-300">{e.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit goal">
        <EditGoalForm goal={goal} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} />
      </Modal>

      <Modal open={logOpen} onClose={() => setLogOpen(false)} title="Log progress">
        <LogProgressForm onSubmit={handleLogProgress} onCancel={() => setLogOpen(false)} />
      </Modal>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-900/50 px-3.5 py-3">
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-700">{label}</p>
      <p className="mt-1 text-sm text-ink-100">{value}</p>
    </div>
  )
}

function EditGoalForm({
  goal,
  onSubmit,
  onCancel,
}: {
  goal: GoalResponse
  onSubmit: (payload: UpdateGoalRequest) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState(goal.title)
  const [description, setDescription] = useState(goal.description ?? '')
  const [currentLevel, setCurrentLevel] = useState(goal.currentLevel)
  const [status, setStatus] = useState(goal.status)
  const [targetDate, setTargetDate] = useState(goal.targetDate)
  const [dailyStudyHours, setDailyStudyHours] = useState(goal.dailyStudyHours)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ title, description, currentLevel, status, targetDate, dailyStudyHours })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save changes.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input id="edit-title" label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        id="edit-description"
        label="Description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select id="edit-level" label="Level" value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value as any)}>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
        <Select id="edit-status" label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="edit-hours"
          label="Daily study hours"
          type="number"
          min={1}
          max={16}
          value={dailyStudyHours}
          onChange={(e) => setDailyStudyHours(Number(e.target.value))}
        />
        <Input
          id="edit-date"
          label="Target date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-signal-rose">{error}</p>}
      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

function LogProgressForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: { entryDate: string; note?: string; growthScore?: number }) => Promise<void>
  onCancel: () => void
}) {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [growthScore, setGrowthScore] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ entryDate, note: note.trim() || undefined, growthScore })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not log progress.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input id="log-date" label="Date" type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
      <Textarea
        id="log-note"
        label="Note (optional)"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What did you work on?"
      />
      <Input
        id="log-score"
        label="Growth score (0–10)"
        type="number"
        min={0}
        max={10}
        value={growthScore}
        onChange={(e) => setGrowthScore(Number(e.target.value))}
      />
      {error && <p className="text-xs text-signal-rose">{error}</p>}
      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          Save entry
        </Button>
      </div>
    </form>
  )
}
