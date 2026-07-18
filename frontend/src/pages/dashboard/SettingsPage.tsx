import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Card, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, updateSettings } from '../../lib/api/auth'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [savedProfile, setSavedProfile] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(user?.settings.email_notifications ?? true)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name ?? '' },
  })

  async function onSubmit(data: { name: string }) {
    await updateProfile({ name: data.name })
    await refreshUser()
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 2000)
  }

  async function toggleNotifications() {
    const next = !emailNotifs
    setEmailNotifs(next)
    await updateSettings({ theme: user?.settings.theme ?? 'dark', email_notifications: next })
    await refreshUser()
  }

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" subtitle="Your account details" />
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Full name" {...register('name')} />
            <Input label="Email" value={user?.email} disabled />
            {savedProfile && <p className="text-xs text-risk-low">Saved.</p>}
            <Button type="submit" isLoading={isSubmitting} className="w-fit">
              Save changes
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="How ShadowAI reaches you" />
          <div className="flex items-center justify-between rounded-xl bg-white/[0.02] p-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Email notifications</p>
              <p className="text-xs text-text-muted">Get notified when a new risk is detected</p>
            </div>
            <button
              onClick={toggleNotifications}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors ${emailNotifs ? 'bg-signal-blue' : 'bg-white/10'}`}
            >
              <div className={`h-5 w-5 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}
