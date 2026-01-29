import { createFileRoute, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useConvexAuth, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useUser, UserButton } from '@clerk/clerk-react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DashboardSquare01Icon,
  Settings01Icon,
  Notification01Icon,
} from '@hugeicons/core-free-icons'
import { useEffect } from 'react'
import {
  initializePush,
  extractSubscriptionKeys,
  isPushSupported,
} from '@/lib/push'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardSquare01Icon },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings01Icon },
]

function DashboardLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const upsertSubscription = useMutation(api.pushSubscriptions.upsertSubscription)

  useEffect(() => {
    if (!isAuthenticated || isLoading) return

    const setupPush = async () => {
      if (!isPushSupported()) return

      try {
        const subscription = await initializePush()
        if (subscription) {
          const keys = extractSubscriptionKeys(subscription)
          await upsertSubscription({
            endpoint: keys.endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            userAgent: navigator.userAgent,
          })
        }
      } catch (error) {
        console.error('[Push] Setup failed:', error)
      }
    }

    setupPush()
  }, [isAuthenticated, isLoading, upsertSubscription])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    )
  }

  if (!isAuthenticated) {
    navigate({ to: '/sign-in' })
    return null
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <HugeiconsIcon icon={Notification01Icon} size={18} />
            </div>
            <span className="font-semibold text-zinc-900">finished.dev</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 [&.active]:bg-zinc-100 [&.active]:text-zinc-900"
              >
                <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-zinc-200 p-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
