import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Key01Icon,
  PlusSignIcon,
  Delete02Icon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  Notification01Icon,
  Cancel01Icon,
  AlertCircleIcon,
  Settings01Icon,
  CommandIcon,
  ShieldKeyIcon,
  VolumeHighIcon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'
import { useState, useEffect } from 'react'
import {
  isPushSupported,
  getPermissionStatus,
  subscribeToPush,
  extractSubscriptionKeys,
} from '@/lib/push'

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
    <div className="flex items-start gap-4 border-b border-zinc-100 pb-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
        <HugeiconsIcon icon={icon} size={22} className="text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
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
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-zinc-900' : 'bg-zinc-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function SettingsPage() {
  const apiKeys = useQuery(api.apiKeys.list, {})
  const createApiKey = useMutation(api.apiKeys.create)
  const deleteApiKey = useMutation(api.apiKeys.remove)
  const settings = useQuery(api.userSettings.get, {})
  const updateSettings = useMutation(api.userSettings.update)
  const upsertSubscription = useMutation(api.pushSubscriptions.upsertSubscription)

  const [keyName, setKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pushStatus, setPushStatus] = useState<
    'loading' | 'unsupported' | 'denied' | 'granted' | 'default'
  >('loading')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) {
      setPushStatus('unsupported')
      return
    }
    setPushStatus(getPermissionStatus())
  }, [])

  const handleEnableNotifications = async () => {
    setSubscribing(true)
    try {
      const subscription = await subscribeToPush()
      if (subscription) {
        const keys = extractSubscriptionKeys(subscription)
        await upsertSubscription({
          endpoint: keys.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: navigator.userAgent,
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

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyName.trim()) return

    setCreating(true)
    try {
      const result = await createApiKey({ name: keyName.trim() })
      setNewKey(result.key)
      setKeyName('')
    } catch (error) {
      console.error('Failed to create API key:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleCopyKey = async () => {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteKey = async (id: any) => {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) {
      return
    }
    try {
      await deleteApiKey({ id })
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
            <HugeiconsIcon icon={Settings01Icon} size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
            <p className="text-sm text-zinc-500">
              Manage your API keys and notification preferences
            </p>
          </div>
        </div>

        {newKey && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/50">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">API Key Created</h3>
                  <p className="text-sm text-emerald-700">
                    Copy this key now. You won&apos;t be able to see it again!
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 overflow-hidden rounded-xl border border-emerald-200 bg-white px-4 py-3">
                  <code className="block truncate font-mono text-sm text-zinc-900">{newKey}</code>
                </div>
                <Button
                  onClick={handleCopyKey}
                  className={
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-zinc-900 hover:bg-zinc-800'
                  }
                >
                  <HugeiconsIcon
                    icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                    size={16}
                  />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Button
                variant="ghost"
                className="mt-4 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                onClick={() => setNewKey(null)}
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
                icon={Key01Icon}
                title="API Keys"
                description="Create API keys to authenticate the CLI with your account"
              />

              <form onSubmit={handleCreateKey} className="mt-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="Key name (e.g., MacBook Pro)"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="flex-1 rounded-xl border-zinc-200 bg-zinc-50 px-4 py-3 transition-colors focus:border-zinc-300 focus:bg-white"
                  />
                  <Button
                    type="submit"
                    disabled={creating || !keyName.trim()}
                    className="rounded-xl bg-zinc-900 px-5 hover:bg-zinc-800"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={16} />
                    {creating ? 'Creating...' : 'Create Key'}
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                {apiKeys === undefined ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-zinc-200 border-t-zinc-900" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
                      <HugeiconsIcon icon={ShieldKeyIcon} size={24} className="text-zinc-400" />
                    </div>
                    <p className="font-medium text-zinc-900">No API keys yet</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Create one to start using the CLI
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {apiKeys.map((key) => (
                      <div
                        key={key._id}
                        className="group flex items-center justify-between py-4 first:pt-0 last:pb-0"
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
                          variant="ghost"
                          size="sm"
                          className="ml-4 text-zinc-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                          onClick={() => handleDeleteKey(key._id)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
            <div className="p-6">
              <SectionHeader
                icon={Notification01Icon}
                title="Notifications"
                description="Configure how you receive task completion notifications"
              />

              <div className="mt-6 space-y-6">
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  {pushStatus === 'loading' ? (
                    <div className="flex items-center gap-4 p-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
                      <span className="text-sm text-zinc-600">
                        Checking notification status...
                      </span>
                    </div>
                  ) : pushStatus === 'unsupported' ? (
                    <div className="flex items-center gap-4 bg-zinc-50 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200">
                        <HugeiconsIcon icon={Cancel01Icon} size={18} className="text-zinc-500" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">Not Supported</p>
                        <p className="text-sm text-zinc-500">
                          Push notifications are not supported in this browser
                        </p>
                      </div>
                    </div>
                  ) : pushStatus === 'denied' ? (
                    <div className="flex items-center gap-4 bg-red-50 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                        <HugeiconsIcon icon={Cancel01Icon} size={18} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">Notifications Blocked</p>
                        <p className="text-sm text-zinc-500">
                          Please enable notifications in your browser settings
                        </p>
                      </div>
                    </div>
                  ) : pushStatus === 'granted' ? (
                    <div className="flex items-center gap-4 bg-emerald-50 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={18}
                          className="text-emerald-600"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">Notifications Enabled</p>
                        <p className="text-sm text-zinc-500">
                          You will receive push notifications when tasks complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-amber-50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                          <HugeiconsIcon
                            icon={AlertCircleIcon}
                            size={18}
                            className="text-amber-600"
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
                        onClick={handleEnableNotifications}
                        disabled={subscribing}
                        className="rounded-xl bg-zinc-900 hover:bg-zinc-800"
                      >
                        {subscribing ? 'Enabling...' : 'Enable'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-zinc-50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                        <HugeiconsIcon
                          icon={SmartPhone01Icon}
                          size={18}
                          className="text-zinc-600"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">Push Notifications</p>
                        <p className="text-sm text-zinc-500">
                          Receive browser notifications when tasks complete
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings?.pushEnabled ?? true}
                      onChange={(checked) => updateSettings({ pushEnabled: checked })}
                      disabled={pushStatus !== 'granted'}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-zinc-50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                        <HugeiconsIcon icon={VolumeHighIcon} size={18} className="text-zinc-600" />
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
                      onChange={(checked) => updateSettings({ soundEnabled: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
            <div className="p-6">
              <SectionHeader
                icon={CommandIcon}
                title="CLI Setup"
                description="Install the finished CLI to start receiving task notifications"
              />

              <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-zinc-500">Terminal</span>
                </div>
                <div className="space-y-4 p-4 font-mono text-sm">
                  <div>
                    <p className="text-zinc-500"># Install globally with bun</p>
                    <p className="text-zinc-100">
                      <span className="text-emerald-400">$</span> bun install -g @finished/cli
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500"># Or run directly with bunx</p>
                    <p className="text-zinc-100">
                      <span className="text-emerald-400">$</span> bunx @finished/cli init
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500"># Configure with your API key</p>
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
                      <span className="text-emerald-400">$</span> finished ping "Task completed!"
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
