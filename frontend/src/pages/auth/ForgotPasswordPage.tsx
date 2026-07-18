import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { forgotPassword } from '../../lib/api/auth'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [demoToken, setDemoToken] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const result = await forgotPassword(data.email)
    setDemoToken(result.demo_reset_token)
    setSent(true)
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send a reset link to your email.">
      {sent ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-signal-blue/10 px-3 py-3 text-sm text-text-primary">
            If that email exists in our system, a reset link is on its way.
          </p>
          {demoToken && (
            <div className="rounded-lg border border-dashed border-signal-purple/40 bg-signal-purple/5 px-3 py-3 text-xs">
              <p className="mb-1 font-medium text-signal-purple">Demo mode — no email provider configured</p>
              <Link to={`/reset-password?token=${demoToken}`} className="break-all text-signal-blue hover:underline">
                Continue to reset password →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
          <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link to="/login" className="font-medium text-signal-blue hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
