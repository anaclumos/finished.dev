import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient, signIn } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [verificationResent, setVerificationResent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailNotVerified(false)
    setVerificationResent(false)
    setLoading(true)
    try {
      await signIn.email(
        { email, password },
        {
          onSuccess: () => navigate({ to: '/dashboard' }),
          onError: (ctx) => {
            if (ctx.error.message === 'Email not verified') {
              setEmailNotVerified(true)
            } else {
              setError(ctx.error.message || 'Invalid credentials')
            }
          },
        }
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendingVerification(true)
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: '/dashboard',
      })
      setVerificationResent(true)
    } finally {
      setResendingVerification(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
        <h1 className="mb-6 font-bold text-2xl text-white">Sign in</h1>
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        {emailNotVerified && (
          <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm">
            <p className="text-yellow-400">
              Your email hasn't been verified yet.
            </p>
            {verificationResent ? (
              <p className="mt-1 text-yellow-300/70">
                Verification email sent! Check your inbox.
              </p>
            ) : (
              <button
                className="mt-1 text-white hover:underline"
                disabled={resendingVerification}
                onClick={handleResendVerification}
                type="button"
              >
                {resendingVerification
                  ? 'Sending...'
                  : 'Resend verification email'}
              </button>
            )}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1.5 block font-medium text-neutral-300 text-sm"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block font-medium text-neutral-300 text-sm"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </div>
          <button
            className="w-full rounded-lg bg-white px-4 py-2.5 font-medium text-black text-sm transition-colors hover:bg-neutral-200 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-neutral-400 text-sm">
          Don't have an account?{' '}
          <a className="text-white hover:underline" href="/sign-up">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
