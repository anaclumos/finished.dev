import { Waitlist } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/waitlist')({
  component: WaitlistPage,
})

function WaitlistPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="font-semibold text-2xl text-zinc-900">
          Join the Waitlist
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Be the first to know when finished.dev launches
        </p>
      </div>
      <Waitlist
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
