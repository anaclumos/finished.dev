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
import { useEffect, useRef, useState } from 'react'
import { signOut, useSession } from '@/lib/auth-client'
import { isPushSupported, subscribeToPush } from '@/lib/push'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardSquare01Icon },
  { name: 'Settings', href: '/settings', icon: Settings01Icon },
]

function AppLayout() {
  const { data, isPending } = useSession()
  const navigate = useNavigate()
  const hasSubscribed = useRef(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (!data || isPending || hasSubscribed.current) {
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
          await fetch('/api/push-subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: keys.endpoint,
              p256dh: keys.p256dh,
              auth: keys.auth,
              userAgent: navigator.userAgent,
            }),
            credentials: 'include',
          })
        }
      } catch (error) {
        console.error('[Push] Setup failed:', error)
      }
    }

    setupPush()
  }, [data, isPending])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    )
  }

  if (!data) {
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
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
                  onClick={() => setShowMenu(!showMenu)}
                  type="button"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 font-medium text-sm text-white">
                    {data?.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                </button>
                {showMenu && (
                  <div className="absolute bottom-full left-0 z-50 mb-2 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                    <div className="border-zinc-100 border-b px-3 py-2">
                      <p className="font-medium text-sm text-zinc-900">
                        {data?.user?.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {data?.user?.email}
                      </p>
                    </div>
                    <button
                      className="w-full px-3 py-2 text-left text-red-500 text-sm transition-colors hover:bg-zinc-50"
                      onClick={() => signOut()}
                      type="button"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-sm text-zinc-900">
                  {data?.user?.name?.split(' ')[0]}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {data?.user?.email}
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
