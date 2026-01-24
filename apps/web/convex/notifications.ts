import { action } from './_generated/server'
import { v } from 'convex/values'
import webpush from 'web-push'

/**
 * Send web push notifications to all subscriptions for a user
 *
 * Queries all push subscriptions for the authenticated user and sends
 * a notification payload to each endpoint using the web-push library.
 *
 * Environment variables required:
 * - WEB_PUSH_PUBLIC_KEY: VAPID public key (base64url encoded)
 * - WEB_PUSH_PRIVATE_KEY: VAPID private key (base64url encoded)
 * - WEB_PUSH_SUBJECT: VAPID subject (mailto: or https: URL)
 */
export const sendNotification = action({
  args: {
    title: v.string(),
    body: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const publicKey = process.env.WEB_PUSH_PUBLIC_KEY
    const privateKey = process.env.WEB_PUSH_PRIVATE_KEY
    const subject = process.env.WEB_PUSH_SUBJECT

    if (!publicKey || !privateKey || !subject) {
      throw new Error(
        'Missing required environment variables: WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY, WEB_PUSH_SUBJECT',
      )
    }

    webpush.setVapidDetails(subject, publicKey, privateKey)

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const userId = identity.subject

    const subscriptions = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()

    if (subscriptions.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        message: 'No push subscriptions found for user',
      }
    }

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
          payload,
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
