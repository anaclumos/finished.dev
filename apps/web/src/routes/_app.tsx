import { UserButton, useUser } from '@clerk/clerk-react'
import { api } from '@convex/_generated/api'
import {
  DashboardSquare01Icon,
  Settings01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useConvexAuth, useMutation } from 'convex/react'
import { useEffect, useRef } from 'react'
import { isPushSupported, subscribeToPush } from '@/lib/push'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardSquare01Icon },
  { name: 'Settings', href: '/settings', icon: Settings01Icon },
]

function AppLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const upsertSubscription = useMutation(
    api.pushSubscriptions.upsertSubscription
  )
  const hasSubscribed = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || isLoading || hasSubscribed.current) {
      return
    }

    if (!isPushSupported()) {
      return
    }

    if (Notification.permission !== 'granted') {
      return
    }

    const setupPush = async () => {
      try {
        const keys = await subscribeToPush()
        if (keys) {
          hasSubscribed.current = true
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
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-zinc-200 border-r bg-white">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-2 border-zinc-200 border-b px-4">
            <img
              alt="finished.dev"
              className="h-8 w-8"
              height={32}
              src="/logo.png"
              width={32}
            />
            <span className="font-semibold text-zinc-900">finished.dev</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => (
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 [&.active]:bg-zinc-100 [&.active]:text-zinc-900"
                key={item.name}
                to={item.href}
              >
                <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-zinc-200 border-t p-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-sm text-zinc-900">
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
