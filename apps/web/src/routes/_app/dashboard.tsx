import { api } from '@convex/_generated/api'
import {
  Activity01Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CommandIcon,
  FlashIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'just now'
  }
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  if (hours < 24) {
    return `${hours}h ago`
  }
  if (days < 7) {
    return `${days}d ago`
  }
  return new Date(timestamp).toLocaleDateString()
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  if (ms < 3_600_000) {
    return `${(ms / 60_000).toFixed(1)}m`
  }
  return `${(ms / 3_600_000).toFixed(1)}h`
}

const statusConfig = {
  success: {
    icon: CheckmarkCircle02Icon,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    ringColor: 'ring-emerald-500/20',
    label: 'Success',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  failure: {
    icon: Cancel01Icon,
    color: 'text-red-600',
    bg: 'bg-red-500/10',
    ringColor: 'ring-red-500/20',
    label: 'Failed',
    badgeClass: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  cancelled: {
    icon: AlertCircleIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    ringColor: 'ring-amber-500/20',
    label: 'Cancelled',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  accentColor = 'zinc',
}: {
  title: string
  value: number | string
  icon: typeof FlashIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  accentColor?: 'zinc' | 'emerald' | 'red' | 'amber'
}) {
  const colorClasses = {
    zinc: {
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-600',
      valueColor: 'text-zinc-900',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    red: {
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
    },
    amber: {
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
    },
  }

  const colors = colorClasses[accentColor]

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="font-medium text-sm text-zinc-500">{title}</p>
          <p
            className={`font-semibold text-3xl tracking-tight ${colors.valueColor}`}
          >
            {value}
          </p>
          {trend && trendValue && (
            <div className="flex items-center gap-1.5">
              {trend === 'up' && (
                <span className="flex items-center gap-0.5 font-medium text-emerald-600 text-xs">
                  <HugeiconsIcon icon={ArrowUp01Icon} size={12} />
                  {trendValue}
                </span>
              )}
              {trend === 'down' && (
                <span className="flex items-center gap-0.5 font-medium text-red-600 text-xs">
                  <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
                  {trendValue}
                </span>
              )}
              <span className="text-xs text-zinc-400">vs last week</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colors.iconBg}`}>
          <HugeiconsIcon className={colors.iconColor} icon={icon} size={20} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-50/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
  )
}

function TaskRow({
  task,
}: {
  task: {
    _id: string
    title: string
    status: string
    createdAt: number
    source?: string
    duration?: number
  }
}) {
  const config =
    statusConfig[task.status as keyof typeof statusConfig] ||
    statusConfig.success

  return (
    <div className="group flex items-center gap-4 rounded-xl px-4 py-4 transition-all duration-150 hover:bg-zinc-50">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ring-1 ${config.ringColor}`}
      >
        <HugeiconsIcon className={config.color} icon={config.icon} size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-900 group-hover:text-zinc-700">
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
          <span>{formatRelativeTime(task.createdAt)}</span>
          {task.source && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-600">
                  {task.source}
                </span>
              </span>
            </>
          )}
          {task.duration && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <HugeiconsIcon icon={Clock01Icon} size={12} />
                {formatDuration(task.duration)}
              </span>
            </>
          )}
        </div>
      </div>

      <Badge className={`shrink-0 border ${config.badgeClass}`}>
        {config.label}
      </Badge>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
        <HugeiconsIcon className="text-zinc-400" icon={CommandIcon} size={28} />
      </div>
      <h3 className="font-semibold text-lg text-zinc-900">No tasks yet</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Set up the CLI to start receiving task notifications. It only takes a
        minute.
      </p>
      <div className="mt-8 w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 text-left">
        <div className="flex items-center gap-2 border-zinc-800 border-b px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-zinc-500">Terminal</span>
        </div>
        <div className="space-y-3 p-4 font-mono text-sm">
          <div>
            <span className="text-zinc-500"># Install the CLI</span>
          </div>
          <div className="text-zinc-100">
            <span className="text-emerald-400">$</span> bun install -g
            @finished/cli
          </div>
          <div className="mt-4">
            <span className="text-zinc-500"># Configure your API key</span>
          </div>
          <div className="text-zinc-100">
            <span className="text-emerald-400">$</span> finished init
          </div>
          <div className="mt-4">
            <span className="text-zinc-500">
              # Send your first notification
            </span>
          </div>
          <div className="text-zinc-100">
            <span className="text-emerald-400">$</span> finished ping "Hello
            World"
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-zinc-200 border-t-zinc-900" />
        <div className="absolute inset-0 flex items-center justify-center">
          <HugeiconsIcon
            className="text-zinc-400"
            icon={Activity01Icon}
            size={16}
          />
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-500">Loading tasks...</p>
    </div>
  )
}

function DashboardPage() {
  const tasks = useQuery(api.agentTasks.list, { limit: 50 })
  const taskCount = useQuery(api.agentTasks.count, {})

  const stats = {
    total: taskCount ?? 0,
    today:
      tasks?.filter((t) => t.createdAt > Date.now() - 24 * 60 * 60 * 1000)
        .length ?? 0,
    success: tasks?.filter((t) => t.status === 'success').length ?? 0,
    failed: tasks?.filter((t) => t.status === 'failure').length ?? 0,
  }

  const successRate =
    stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0

  return (
    <div className="min-h-screen bg-zinc-50/50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
              <HugeiconsIcon
                className="text-white"
                icon={Activity01Icon}
                size={20}
              />
            </div>
            <div>
              <h1 className="font-semibold text-2xl text-zinc-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-zinc-500">
                Monitor your agent task completions in real-time
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accentColor="zinc"
            icon={FlashIcon}
            title="Total Tasks"
            value={stats.total}
          />
          <StatCard
            accentColor="amber"
            icon={Clock01Icon}
            title="Today"
            value={stats.today}
          />
          <StatCard
            accentColor="emerald"
            icon={CheckmarkCircle02Icon}
            title="Successful"
            value={stats.success}
          />
          <StatCard
            accentColor="red"
            icon={Cancel01Icon}
            title="Failed"
            value={stats.failed}
          />
        </div>

        {stats.total > 0 && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-r from-zinc-900 to-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-zinc-400">
                  Success Rate
                </p>
                <p className="mt-1 font-bold text-4xl text-white">
                  {successRate}%
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <HugeiconsIcon
                  className="text-emerald-400"
                  icon={CheckmarkCircle02Icon}
                  size={32}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-zinc-100 border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-lg text-zinc-900">
                Recent Tasks
              </h2>
              {tasks && tasks.length > 0 && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-medium text-xs text-zinc-600">
                  {tasks.length}
                </span>
              )}
            </div>
            {tasks && tasks.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-medium text-xs text-zinc-500">Live</span>
              </div>
            )}
          </div>

          <div className="divide-y divide-zinc-100">
            {tasks === undefined ? (
              <LoadingState />
            ) : tasks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {tasks.map((task) => (
                  <TaskRow key={task._id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
