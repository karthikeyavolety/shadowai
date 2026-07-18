import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Login failed. Check your credentials.')
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to check your latest exposure report.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />

        {serverError && <p className="rounded-lg bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">{serverError}</p>}

        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-xs text-signal-blue hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-signal-blue hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
