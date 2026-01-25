import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Create an account</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Get started with finished.dev
        </p>
      </div>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
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
