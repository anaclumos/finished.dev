import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
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
} from '@hugeicons/core-free-icons'
import { useState, useEffect } from 'react'
import {
  isPushSupported,
  getPermissionStatus,
  subscribeToPush,
  extractSubscriptionKeys,
} from '@/lib/push'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

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
  const [pushStatus, setPushStatus] = useState<'loading' | 'unsupported' | 'denied' | 'granted' | 'default'>('loading')
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage your API keys and notification preferences.
        </p>
      </div>

      {/* New Key Created */}
      {newKey && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
              API Key Created
            </CardTitle>
            <CardDescription className="text-green-700">
              Copy this key now. You won&apos;t be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-white px-4 py-3 font-mono text-sm">
                {newKey}
              </code>
              <Button onClick={handleCopyKey} variant="outline">
                <HugeiconsIcon
                  icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                  size={16}
                />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setNewKey(null)}
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Keys */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Key01Icon} size={20} />
            API Keys
          </CardTitle>
          <CardDescription>
            Create API keys to authenticate the CLI with your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Create new key */}
          <form onSubmit={handleCreateKey} className="mb-6">
            <FieldGroup>
              <Field orientation="horizontal">
                <div className="flex flex-1 gap-2">
                  <Input
                    placeholder="Key name (e.g., MacBook Pro)"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={creating || !keyName.trim()}>
                    <HugeiconsIcon icon={PlusSignIcon} size={16} />
                    {creating ? 'Creating...' : 'Create Key'}
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </form>

          {/* Existing keys */}
          {apiKeys === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No API keys yet. Create one to get started.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {apiKeys.map((key) => (
                <div
                  key={key._id}
                  className="flex items-center justify-between py-4 first:pt-0"
                >
                  <div>
                    <div className="font-medium text-zinc-900">{key.name}</div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono">
                        {key.keyPrefix}...
                      </code>
                      <span>·</span>
                      <span>Created {formatDate(key.createdAt)}</span>
                      {key.lastUsedAt && (
                        <>
                          <span>·</span>
                          <span>Last used {formatDate(key.lastUsedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteKey(key._id)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Notification01Icon} size={20} />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive task completion notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 p-4">
              {pushStatus === 'loading' ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                  <span className="text-sm text-zinc-600">Checking notification status...</span>
                </div>
              ) : pushStatus === 'unsupported' ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
                    <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-zinc-500" />
                  </div>
                  <div>
                    <div className="font-medium text-zinc-900">Not Supported</div>
                    <div className="text-sm text-zinc-500">
                      Push notifications are not supported in this browser.
                    </div>
                  </div>
                </div>
              ) : pushStatus === 'denied' ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-zinc-900">Notifications Blocked</div>
                    <div className="text-sm text-zinc-500">
                      Please enable notifications in your browser settings.
                    </div>
                  </div>
                </div>
              ) : pushStatus === 'granted' ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-zinc-900">Notifications Enabled</div>
                    <div className="text-sm text-zinc-500">
                      You will receive push notifications when tasks complete.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                      <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900">Enable Notifications</div>
                      <div className="text-sm text-zinc-500">
                        Get notified when your tasks complete.
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleEnableNotifications} disabled={subscribing}>
                    {subscribing ? 'Enabling...' : 'Enable'}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-zinc-900">Push Notifications</div>
                  <div className="text-sm text-zinc-500">
                    Receive browser notifications when tasks complete
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.pushEnabled ?? true}
                  onChange={(e) => updateSettings({ pushEnabled: e.target.checked })}
                  className="h-5 w-5 rounded border-zinc-300"
                  disabled={pushStatus !== 'granted'}
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-zinc-900">Sound</div>
                  <div className="text-sm text-zinc-500">
                    Play a sound when notifications arrive
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.soundEnabled ?? true}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="h-5 w-5 rounded border-zinc-300"
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CLI Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>CLI Setup</CardTitle>
          <CardDescription>
            Install the finished CLI to start receiving task notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-zinc-100">
            <div className="text-zinc-500"># Install globally with bun</div>
            <div>bun install -g @finished/cli</div>
            <div className="mt-4 text-zinc-500"># Or run directly with bunx</div>
            <div>bunx @finished/cli init</div>
            <div className="mt-4 text-zinc-500"># Configure with your API key</div>
            <div>finished init</div>
            <div className="mt-4 text-zinc-500"># Test the connection</div>
            <div>finished test</div>
            <div className="mt-4 text-zinc-500"># Send a notification</div>
            <div>finished ping "Task completed!"</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
