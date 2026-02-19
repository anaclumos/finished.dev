import {
  AlertCircleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CommandIcon,
  Copy01Icon,
  Delete02Icon,
  Key01Icon,
  Notification01Icon,
  PlusSignIcon,
  Settings01Icon,
  ShieldKeyIcon,
  SmartPhone01Icon,
  VolumeHighIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useLiveQuery } from '@tanstack/react-db'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  type ApiKey,
  apiKeysCollection,
  userSettingsCollection,
} from '@/lib/collections'
import { formatDate } from '@/lib/formatters'
import {
  getPermissionStatus,
  isPushSupported,
  subscribeToPush,
} from '@/lib/push'
import { getQueryClient } from '@/lib/query-client'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: typeof Key01Icon
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 border-zinc-200/80 border-b pb-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
        <HugeiconsIcon className="text-inherit" icon={icon} size={22} />
      </div>
      <div>
        <h2 className="font-semibold text-lg text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      aria-checked={checked}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-zinc-900' : 'bg-zinc-200'
      }`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function ApiKeysList({
  apiKeys,
  formatDate,
  onDeleteKey,
}: {
  apiKeys: ApiKey[] | undefined
  formatDate: (timestamp: string | number | Date) => string
  onDeleteKey: (id: string) => void
}) {
  if (apiKeys === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-zinc-200 border-t-zinc-900" />
      </div>
    )
  }

  if (apiKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
          <HugeiconsIcon
            className="text-zinc-400"
            icon={ShieldKeyIcon}
            size={24}
          />
        </div>
        <p className="font-medium text-zinc-900">No API keys yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Create one to start using the CLI
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-200/80">
      {apiKeys.map((key) => (
        <div
          className="group flex items-center justify-between py-4 first:pt-0 last:pb-0"
          key={key.id}
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900">{key.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
              <code className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-600">
                {key.keyPrefix}...
              </code>
              <span className="text-zinc-300">·</span>
              <span>Created {formatDate(key.createdAt)}</span>
              {key.lastUsedAt && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span className="text-emerald-600">
                    Last used {formatDate(key.lastUsedAt)}
                  </span>
                </>
              )}
            </div>
          </div>
          <Button
            className="ml-4 text-zinc-500/70 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
            onClick={() => onDeleteKey(key.id)}
            size="sm"
            variant="ghost"
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} />
            Delete
          </Button>
        </div>
      ))}
    </div>
  )
}

type PushStatus = 'loading' | 'unsupported' | 'denied' | 'granted' | 'default'

function PushStatusBanner({
  status,
  subscribing,
  onEnableClick,
}: {
  status: PushStatus
  subscribing: boolean
  onEnableClick: () => void
}) {
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-4 p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
        <span className="text-sm text-zinc-600">
          Checking notification status...
        </span>
      </div>
    )
  }

  if (status === 'unsupported') {
    return (
      <div className="flex items-center gap-4 bg-zinc-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200">
          <HugeiconsIcon
            className="text-zinc-500"
            icon={Cancel01Icon}
            size={18}
          />
        </div>
        <div>
          <p className="font-medium text-zinc-900">Not Supported</p>
          <p className="text-sm text-zinc-500">
            Push notifications are not supported in this browser
          </p>
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-4 bg-red-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
          <HugeiconsIcon
            className="text-red-600"
            icon={Cancel01Icon}
            size={18}
          />
        </div>
        <div>
          <p className="font-medium text-zinc-900">Notifications Blocked</p>
          <p className="text-sm text-zinc-500">
            Please enable notifications in your browser settings
          </p>
        </div>
      </div>
    )
  }

  if (status === 'granted') {
    return (
      <div className="flex items-center gap-4 bg-emerald-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <HugeiconsIcon
            className="text-emerald-600"
            icon={CheckmarkCircle02Icon}
            size={18}
          />
        </div>
        <div>
          <p className="font-medium text-zinc-900">Notifications Enabled</p>
          <p className="text-sm text-zinc-500">
            You will receive push notifications when tasks complete
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between bg-amber-50 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <HugeiconsIcon
            className="text-amber-600"
            icon={AlertCircleIcon}
            size={18}
          />
        </div>
        <div>
          <p className="font-medium text-zinc-900">Enable Notifications</p>
          <p className="text-sm text-zinc-500">
            Get notified when your tasks complete
          </p>
        </div>
      </div>
      <Button
        className="rounded-xl bg-zinc-900 hover:bg-zinc-800"
        disabled={subscribing}
        onClick={onEnableClick}
      >
        {subscribing ? 'Enabling...' : 'Enable'}
      </Button>
    </div>
  )
}

function useSettings() {
  const { data: apiKeysData } = useLiveQuery((q) =>
    q
      .from({ key: apiKeysCollection })
      .orderBy(({ key }) => key.createdAt, 'desc')
  )
  const apiKeys = apiKeysData ?? undefined

  const { data: settingsData } = useLiveQuery((q) =>
    q.from({ s: userSettingsCollection }).findOne()
  )
  const settings = settingsData ?? {
    pushEnabled: true,
    soundEnabled: true,
  }

  const [keyName, setKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pushStatus, setPushStatus] = useState<
    'loading' | 'unsupported' | 'denied' | 'granted' | 'default'
  >('loading')
  const [subscribing, setSubscribing] = useState(false)
  const [testNotificationStatus, setTestNotificationStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle')
  const [testNotificationMessage, setTestNotificationMessage] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!isPushSupported()) {
      setPushStatus('unsupported')
      return
    }
    setPushStatus(getPermissionStatus())
  }, [])

  useEffect(() => {
    if (testNotificationStatus !== 'success') {
      return
    }

    const timeout = setTimeout(() => {
      setTestNotificationStatus('idle')
      setTestNotificationMessage(null)
    }, 4000)

    return () => clearTimeout(timeout)
  }, [testNotificationStatus])

  const handleEnableNotifications = async () => {
    setSubscribing(true)
    try {
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission()
        if (result !== 'granted') {
          setPushStatus(getPermissionStatus())
          return
        }
      } else if (Notification.permission === 'denied') {
        setPushStatus('denied')
        return
      }

      const keys = await subscribeToPush()
      if (keys) {
        await handleUpsertSubscription({
          endpoint: keys.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        })
        setPushStatus('granted')
      } else {
        setPushStatus(getPermissionStatus())
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error)
      setPushStatus(getPermissionStatus())
    } finally {
      setSubscribing(false)
    }
  }

  const handleSendTestNotification = async () => {
    setTestNotificationStatus('sending')
    setTestNotificationMessage(null)

    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include',
      })
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        throw new Error(
          (errorBody as { statusMessage?: string })?.statusMessage ??
            `Failed to send test notification (${res.status}).`
        )
      }

      const result = (await res.json()) as {
        success: boolean
        sent: number
        message?: string
      }

      if (result.sent > 0) {
        setTestNotificationStatus('success')
        setTestNotificationMessage('Test notification sent. Check your device.')
      } else {
        setTestNotificationStatus('error')
        setTestNotificationMessage(
          result.message ?? 'Failed to send test notification.'
        )
      }
    } catch (error) {
      setTestNotificationStatus('error')
      setTestNotificationMessage(
        error instanceof Error
          ? error.message
          : 'Failed to send test notification.'
      )
    }
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyName.trim()) {
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName.trim() }),
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Failed to create API key.')
      }

      const result = (await res.json()) as { key: string }
      setNewKey(result.key)
      setKeyName('')
      getQueryClient().invalidateQueries({ queryKey: ['api-keys'] })
    } catch (error) {
      console.error('Failed to create API key:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleCopyKey = async () => {
    if (!newKey) {
      return
    }
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteKey = async (id: string) => {
    const confirmAction = Reflect.get(globalThis, 'confirm')
    const confirmed =
      typeof confirmAction === 'function'
        ? confirmAction.call(
            globalThis,
            'Are you sure you want to delete this API key? This cannot be undone.'
          )
        : false
    if (!confirmed) {
      return
    }
    try {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Failed to delete API key.')
      }
      getQueryClient().invalidateQueries({ queryKey: ['api-keys'] })
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }

  const handleUpdateSettings = async (update: {
    pushEnabled?: boolean
    soundEnabled?: boolean
  }) => {
    try {
      const res = await fetch('/api/user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Failed to update settings.')
      }
      getQueryClient().invalidateQueries({ queryKey: ['user-settings'] })
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  const handleUpsertSubscription = async (keys: {
    endpoint: string
    p256dh: string
    auth: string
  }) => {
    const res = await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys),
      credentials: 'include',
    })
    if (!res.ok) {
      throw new Error('Failed to subscribe for push notifications.')
    }
  }

  const pushEnabled = settings?.pushEnabled ?? true
  const testUnavailableReason = (() => {
    if (pushStatus !== 'granted') {
      return 'Enable notifications in your browser to send a test.'
    }
    if (!pushEnabled) {
      return 'Turn on Push Notifications to send a test.'
    }
    return null
  })()
  const canSendTestNotification =
    pushStatus === 'granted' &&
    pushEnabled &&
    !subscribing &&
    testNotificationStatus !== 'sending'

  return {
    apiKeys,
    settings,
    keyName,
    setKeyName,
    creating,
    newKey,
    setNewKey,
    copied,
    pushStatus,
    subscribing,
    testNotificationStatus,
    testNotificationMessage,
    canSendTestNotification,
    testUnavailableReason,
    handleCreateKey,
    handleCopyKey,
    handleDeleteKey,
    handleUpdateSettings,
    handleEnableNotifications,
    handleSendTestNotification,
  }
}

function SettingsPage() {
  const {
    apiKeys,
    settings,
    keyName,
    setKeyName,
    creating,
    newKey,
    setNewKey,
    copied,
    pushStatus,
    subscribing,
    testNotificationStatus,
    testNotificationMessage,
    canSendTestNotification,
    testUnavailableReason,
    handleCreateKey,
    handleCopyKey,
    handleDeleteKey,
    handleUpdateSettings,
    handleEnableNotifications,
    handleSendTestNotification,
  } = useSettings()

  return (
    <div className="min-h-screen bg-zinc-50/50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
            <HugeiconsIcon
              className="text-white"
              icon={Settings01Icon}
              size={20}
            />
          </div>
          <div>
            <h1 className="font-semibold text-2xl text-zinc-900 tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-zinc-500">
              Manage your API keys and notification preferences
            </p>
          </div>
        </div>

        {newKey && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-emerald-50/80">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                  <HugeiconsIcon
                    className="text-white"
                    icon={CheckmarkCircle02Icon}
                    size={20}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">
                    API Key Created
                  </h3>
                  <p className="text-emerald-700 text-sm">
                    Copy this key now. You won&apos;t be able to see it again!
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 overflow-hidden rounded-xl border border-emerald-200/70 bg-white/80 px-4 py-3">
                  <code className="block truncate font-mono text-emerald-900 text-sm">
                    {newKey}
                  </code>
                </div>
                <Button
                  className={
                    copied
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }
                  onClick={handleCopyKey}
                >
                  <HugeiconsIcon
                    icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                    size={16}
                  />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Button
                className="mt-4 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                onClick={() => setNewKey(null)}
                variant="ghost"
              >
                Done
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <section className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
            <div className="p-6">
              <SectionHeader
                description="Create API keys to authenticate the CLI with your account"
                icon={Key01Icon}
                title="API Keys"
              />

              <form className="mt-6" onSubmit={handleCreateKey}>
                <div className="flex gap-3">
                  <Input
                    className="flex-1 rounded-xl border-zinc-200 bg-zinc-50/70 px-4 py-3 transition-colors focus:border-zinc-900 focus:bg-white"
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Key name (e.g., MacBook Pro)"
                    value={keyName}
                  />
                  <Button
                    className="rounded-xl bg-zinc-900 px-5 text-white hover:bg-zinc-800"
                    disabled={creating || !keyName.trim()}
                    type="submit"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={16} />
                    {creating ? 'Creating...' : 'Create Key'}
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                <ApiKeysList
                  apiKeys={apiKeys}
                  formatDate={formatDate}
                  onDeleteKey={handleDeleteKey}
                />
              </div>
            </div>
          </section>

          <section className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
            <div className="p-6">
              <SectionHeader
                description="Configure how you receive task completion notifications"
                icon={Notification01Icon}
                title="Notifications"
              />

              <div className="mt-6 space-y-6">
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <PushStatusBanner
                    onEnableClick={handleEnableNotifications}
                    status={pushStatus}
                    subscribing={subscribing}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-zinc-50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                        <HugeiconsIcon
                          className="text-zinc-600"
                          icon={SmartPhone01Icon}
                          size={18}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">
                          Push Notifications
                        </p>
                        <p className="text-sm text-zinc-500">
                          Receive browser notifications when tasks complete
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings?.pushEnabled ?? true}
                      disabled={pushStatus !== 'granted'}
                      onChange={(checked) =>
                        handleUpdateSettings({ pushEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-zinc-50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                        <HugeiconsIcon
                          className="text-zinc-600"
                          icon={VolumeHighIcon}
                          size={18}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">Sound</p>
                        <p className="text-sm text-zinc-500">
                          Play a sound when notifications arrive
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings?.soundEnabled ?? true}
                      onChange={(checked) =>
                        handleUpdateSettings({ soundEnabled: checked })
                      }
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                        <HugeiconsIcon
                          className="text-zinc-600"
                          icon={Notification01Icon}
                          size={18}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">
                          Test Notification
                        </p>
                        <p className="text-sm text-zinc-500">
                          Send a sample notification to confirm everything works
                        </p>
                      </div>
                    </div>
                    <Button
                      className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
                      disabled={!canSendTestNotification}
                      onClick={handleSendTestNotification}
                    >
                      {testNotificationStatus === 'sending'
                        ? 'Sending...'
                        : 'Send Test'}
                    </Button>
                  </div>
                  {testUnavailableReason && (
                    <p className="mt-3 text-xs text-zinc-500">
                      {testUnavailableReason}
                    </p>
                  )}
                  {testNotificationMessage && (
                    <p
                      className={`mt-3 text-xs ${
                        testNotificationStatus === 'success'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {testNotificationMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
            <div className="p-6">
              <SectionHeader
                description="Install the finished CLI to start receiving task notifications"
                icon={CommandIcon}
                title="CLI Setup"
              />

              <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2 border-zinc-800 border-b px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-zinc-500">Terminal</span>
                </div>
                <div className="space-y-4 p-4 font-mono text-sm">
                  <div>
                    <p className="text-zinc-500"># Install globally with bun</p>
                    <p className="text-zinc-100">
                      <span className="text-emerald-400">$</span> bun install -g
                      @finished/cli
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500"># Or run directly with bunx</p>
                    <p className="text-zinc-100">
                      <span className="text-emerald-400">$</span> bunx
                      @finished/cli init
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">
                      # Configure with your API key
                    </p>
                    <p className="text-zinc-100">
                      <span className="text-emerald-400">$</span> finished init
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500"># Test the connection</p>
                    <p className="text-zinc-100">
                      <span className="text-emerald-400">$</span> finished test
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500"># Send a notification</p>
                    <p className="text-zinc-100">
                      <span className="text-emerald-400">$</span> finished ping
                      'Task completed'
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
