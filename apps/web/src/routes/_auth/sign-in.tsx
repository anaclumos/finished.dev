import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in to your account to continue
        </p>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border border-zinc-200 rounded-xl',
          },
        }}
      />
    </div>
  )
}
