import { actionGeneric } from 'convex/server'
import { v } from 'convex/values'

export const sendStatusWebhook = actionGeneric({
  args: {
    url: v.string(),
    status: v.string(),
    message: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const { url, ...payload } = args

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Webhook error:', error)
      throw new Error(
        `Failed to send webhook: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  },
})
