'use client'

import * as React from 'react'
import { useConvexAuth, useQuery, useMutation, useAction } from 'convex/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { HugeiconsIcon } from '@hugeicons/react'
import { Activity01Icon, SentIcon } from '@hugeicons/core-free-icons'

export function StatusManager() {
  const { isAuthenticated } = useConvexAuth()

  const updates = useQuery('statusUpdates:listStatusUpdates' as any) || []
  const createUpdate = useMutation('statusUpdates:createStatusUpdate' as any)
  const sendWebhook = useAction('webhooks:sendStatusWebhook' as any)

  const [status, setStatus] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [webhookUrl, setWebhookUrl] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) return
    setLoading(true)

    try {
      const result = await createUpdate({ status, message })

      if (webhookUrl) {
        await sendWebhook({
          url: webhookUrl,
          status: result.status,
          message: result.message,
          createdAt: result.createdAt,
          createdBy: result.createdBy,
        })
      }

      setStatus('')
      setMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-4">
      <Card className="border-2 border-zinc-800 bg-zinc-950 text-zinc-100 shadow-[4px_4px_0px_0px_rgba(39,39,42,1)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Activity01Icon} className="text-amber-500" />
            <CardTitle className="font-mono text-xl uppercase tracking-widest">
              System Status
            </CardTitle>
          </div>
          <CardDescription className="font-mono text-xs text-zinc-500">
            Broadcast updates to connected webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel className="font-mono text-xs uppercase text-zinc-400">
                  Status Code
                </FieldLabel>
                <Input
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="OPERATIONAL"
                  className="border-zinc-800 bg-zinc-900 font-mono text-zinc-100 placeholder:text-zinc-700 focus:border-amber-500 focus:ring-amber-500/20"
                  required
                />
              </Field>
              <Field>
                <FieldLabel className="font-mono text-xs uppercase text-zinc-400">
                  Message Payload
                </FieldLabel>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="All systems functioning within normal parameters."
                  className="border-zinc-800 bg-zinc-900 font-mono text-zinc-100 placeholder:text-zinc-700 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </Field>
              <Field>
                <FieldLabel className="font-mono text-xs uppercase text-zinc-400">
                  Webhook Target
                </FieldLabel>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.example.com/webhooks/status"
                  className="border-zinc-800 bg-zinc-900 font-mono text-zinc-100 placeholder:text-zinc-700 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </Field>
              <Button
                type="submit"
                disabled={!isAuthenticated || loading}
                className="w-full bg-amber-600 font-mono font-bold uppercase text-zinc-950 hover:bg-amber-500 disabled:opacity-50"
              >
                {loading ? 'Transmitting...' : 'Broadcast Update'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="font-mono text-sm font-bold uppercase text-zinc-500">
          Transmission Log
        </h3>
        {updates?.map((update: any) => (
          <Card
            key={update._id}
            className="border border-zinc-800 bg-zinc-900/50"
          >
            <CardContent className="flex items-start justify-between p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-amber-500/50 font-mono text-amber-500"
                  >
                    {update.status}
                  </Badge>
                  <span className="font-mono text-xs text-zinc-600">
                    {new Date(update.createdAt).toISOString()}
                  </span>
                </div>
                {update.message && (
                  <p className="font-mono text-sm text-zinc-300">
                    {update.message}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-zinc-600">
                  <HugeiconsIcon icon={SentIcon} size={12} />
                  <span className="font-mono">
                    ID: {update.createdBy.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
