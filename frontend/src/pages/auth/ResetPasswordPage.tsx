import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { resetPassword } from '../../lib/api/auth'

const schema = z.object({
  new_password: z.string().min(8, 'At least 8 characters').max(72, 'Must be 72 characters or fewer'),
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      await resetPassword(token, data.new_password)
      setDone(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Reset link is invalid or expired.')
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This reset link is missing its token.">
        <Link to="/forgot-password" className="text-sm text-signal-blue hover:underline">
          Request a new reset link →
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose something you haven't used before.">
      {done ? (
        <p className="rounded-lg bg-risk-low/10 px-3 py-3 text-sm text-risk-low">Password updated — redirecting to sign in…</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="New password" type="password" placeholder="••••••••" {...register('new_password')} error={errors.new_password?.message} />
          {serverError && <p className="rounded-lg bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">{serverError}</p>}
          <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
            Reset password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
