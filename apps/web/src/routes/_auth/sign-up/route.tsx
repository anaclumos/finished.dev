import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { signUp } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp.email(
        { name, email, password },
        {
          onSuccess: () => setEmailSent(true),
          onError: (ctx) =>
            setError(ctx.error.message || 'Something went wrong'),
        }
      )
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <title>Email</title>
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mb-2 font-bold text-2xl text-white">
            Check your email
          </h1>
          <p className="mb-6 text-neutral-400 text-sm">
            We sent a verification link to{' '}
            <span className="text-white">{email}</span>. Click the link to
            verify your account.
          </p>
          <p className="text-neutral-500 text-xs">
            Didn't get the email? Check your spam folder or{' '}
            <button
              className="text-white hover:underline"
              onClick={() => setEmailSent(false)}
              type="button"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
        <h1 className="mb-6 font-bold text-2xl text-white">Create account</h1>
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1.5 block font-medium text-neutral-300 text-sm"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              type="text"
              value={name}
            />
          </div>
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
              minLength={8}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-neutral-400 text-sm">
          Already have an account?{' '}
          <a className="text-white hover:underline" href="/sign-in">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
