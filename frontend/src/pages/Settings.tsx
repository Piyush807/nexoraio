import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../api/auth'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { ApiError } from '../types/common'
import { clearUserCache } from '../api/cache'

export default function Settings() {
  const { user, logout } = useAuth()
  const { push } = useToast()

  return (
    <div className="nexora-page nexora-page-settings max-w-3xl">
      <div className="border-b border-amber-300/10 pb-6">
        <p className="nexora-kicker text-amber-200/75">Workspace</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-100">Settings</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500">Account details, browser data and security — kept simple and local where possible.</p>
      </div>

      <Card className="mt-8 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="nexora-kicker text-cyan-200/70">Identity</p><h2 className="mt-1 font-display text-lg font-semibold text-ink-100">Account</h2></div><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(52,211,153,.7)]" /></div>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Email</dt>
            <dd className="text-ink-100">{user?.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Role</dt>
            <dd><Badge tone="neutral">{user?.role}</Badge></dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Status</dt>
            <dd><Badge tone={user?.enabled ? 'mint' : 'rose'}>{user?.enabled ? 'Active' : 'Disabled'}</Badge></dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-5 p-6 sm:p-7">
        <p className="nexora-kicker text-amber-200/70">Browser only</p><h2 className="mt-1 font-display text-lg font-semibold text-ink-100">Local data</h2>
        <p className="mt-1 text-xs leading-5 text-ink-700">
          Nexora keeps a short-lived browser cache for faster navigation and restores unfinished form or chat drafts in this tab. Clearing it does not delete anything from your account.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => { clearUserCache(); push('Local cache cleared.', 'success') }}
        >
          Clear local cache
        </Button>
      </Card>

      <Card className="mt-5 p-6 sm:p-7">
        <p className="nexora-kicker text-rose-200/70">Security</p><h2 className="mt-1 font-display text-lg font-semibold text-ink-100">Change password</h2>
        <p className="mt-1 text-xs text-ink-700">
          Changing your password signs you out of any other device or browser.
        </p>
        <ChangePasswordForm />
      </Card>

      <Card className="mt-5 border-rose-300/10 bg-rose-300/[.025] p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="nexora-kicker text-rose-200/70">Session</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-ink-100">Sign out of this device</h2>
            <p className="mt-1 text-xs leading-5 text-ink-600">Your account stays intact. You can sign back in whenever you’re ready.</p>
          </div>
          <Button type="button" variant="danger" onClick={logout}>Sign out</Button>
        </div>
      </Card>
    </div>
  )
}

function ChangePasswordForm() {
  const { push } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      push('Password updated.', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update your password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <Input
        id="current-password"
        label="Current password"
        type="password"
        autoComplete="current-password"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Input
        id="new-password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="At least 8 characters"
      />
      <Input
        id="confirm-password"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {error && (
        <p role="alert" className="rounded-md border border-signal-rose/30 bg-signal-rose/10 px-3 py-2 text-xs text-signal-rose">
          {error}
        </p>
      )}
      <Button type="submit" isLoading={submitting} className="mt-1 self-start">
        Update password
      </Button>
    </form>
  )
}
