import { v } from 'convex/values'
import { internal } from './_generated/api'
import { action } from './_generated/server'

interface SendTestNotificationResult {
  success: boolean
  sent: number
  failed: number
  message?: string
  errors?: string[]
}

export const sendTestNotification: ReturnType<typeof action> = action({
  args: {
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<SendTestNotificationResult> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const userId = identity.subject
    const settings = await ctx.runQuery(internal.userSettingsInternal.get, {
      userId,
    })

    if (settings?.pushEnabled === false) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        message: 'Push notifications are disabled in settings.',
      }
    }

    const title = args.title ?? 'Test Notification'
    const body = args.body ?? 'This is a test notification from finished.dev.'
    const url = args.url ?? '/settings'

    return await ctx.runAction(internal.agentHooks.notifyAgentCompletion, {
      userId,
      title,
      body,
      url,
    })
  },
})
