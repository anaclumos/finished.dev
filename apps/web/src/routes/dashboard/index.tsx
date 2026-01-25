import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  AlertCircleIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

const statusConfig = {
  success: {
    icon: CheckmarkCircle02Icon,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'Success',
  },
  failure: {
    icon: Cancel01Icon,
    color: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Failed',
  },
  cancelled: {
    icon: AlertCircleIcon,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    label: 'Cancelled',
  },
}

function DashboardPage() {
  const tasks = useQuery(api.agentTasks.list, { limit: 50 })
  const taskCount = useQuery(api.agentTasks.count, {})

  const stats = {
    total: taskCount ?? 0,
    today:
      tasks?.filter((t) => t.createdAt > Date.now() - 24 * 60 * 60 * 1000).length ?? 0,
    success: tasks?.filter((t) => t.status === 'success').length ?? 0,
    failed: tasks?.filter((t) => t.status === 'failure').length ?? 0,
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Monitor your AI agent task completions in real-time.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
            <div className="text-sm text-zinc-600">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-zinc-900">{stats.today}</div>
            <div className="text-sm text-zinc-600">Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-zinc-600">Successful</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-zinc-600">Failed</div>
          </CardContent>
        </Card>
      </div>

      {/* Task Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                <HugeiconsIcon icon={Clock01Icon} size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900">No tasks yet</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Set up the CLI to start receiving task notifications.
              </p>
              <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-left font-mono text-sm">
                <div className="text-zinc-500"># Install the CLI</div>
                <div className="text-zinc-900">bun install -g @finished/cli</div>
                <div className="mt-2 text-zinc-500"># Configure your API key</div>
                <div className="text-zinc-900">finished init</div>
                <div className="mt-2 text-zinc-500"># Send your first notification</div>
                <div className="text-zinc-900">finished ping "Hello World"</div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {tasks.map((task) => {
                const config = statusConfig[task.status as keyof typeof statusConfig] ||
                  statusConfig.success

                return (
                  <div
                    key={task._id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${config.bg}`}>
                        <HugeiconsIcon
                          icon={config.icon}
                          size={16}
                          className={config.color}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900">{task.title}</div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <span>{formatRelativeTime(task.createdAt)}</span>
                          {task.source && (
                            <>
                              <span>·</span>
                              <span>{task.source}</span>
                            </>
                          )}
                          {task.duration && (
                            <>
                              <span>·</span>
                              <span>{formatDuration(task.duration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border-current ${config.color}`}
                    >
                      {config.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
