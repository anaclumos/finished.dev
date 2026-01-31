'use node'

import { v } from 'convex/values'
import webpush from 'web-push'
import { internalAction } from './_generated/server'

/**
 * Internal action to trigger web push notifications on agent completion
 *
 * Called by external agent completion logic to notify users when their
 * agent tasks complete. This is an internal action (not exposed to clients)
 * and does not require user authentication.
 *
 * Environment variables required:
 * - WEB_PUSH_PUBLIC_KEY: VAPID public key (base64url encoded)
 * - WEB_PUSH_PRIVATE_KEY: VAPID private key (base64url encoded)
 * - WEB_PUSH_SUBJECT: VAPID subject (mailto: or https: URL)
 */
export const notifyAgentCompletion = internalAction({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate environment variables
    const publicKey = process.env.WEB_PUSH_PUBLIC_KEY
    const privateKey = process.env.WEB_PUSH_PRIVATE_KEY
    const subject = process.env.WEB_PUSH_SUBJECT

    if (!(publicKey && privateKey && subject)) {
      throw new Error(
        'Missing required environment variables: WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY, WEB_PUSH_SUBJECT'
      )
    }

    // Set VAPID details for web-push library
    webpush.setVapidDetails(subject, publicKey, privateKey)

    // Query all push subscriptions for the target user
    const subscriptions = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()

    if (subscriptions.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        message: 'No push subscriptions found for user',
      }
    }

    // Construct JSON payload with title, body, and data.url
    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      data: {
        url: args.url,
      },
    })

    let sent = 0
    let failed = 0
    const errors: string[] = []

    // Send notification to each subscription
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        )
        sent++
      } catch (error) {
        failed++
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        errors.push(`${subscription.endpoint}: ${errorMessage}`)
      }
    }

    return {
      success: failed === 0,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    }
  },
})
