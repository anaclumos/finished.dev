import { httpRouter } from 'convex/server'
import { internal } from './_generated/api'
import { httpAction } from './_generated/server'

const http = httpRouter()

/**
 * Hash function for API key validation
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Webhook endpoint for CLI to report completed tasks
 * POST /api/webhook/task
 *
 * Headers:
 *   Authorization: Bearer fin_xxxxx
 *
 * Body:
 *   {
 *     "title": "Task name",
 *     "status": "success" | "failure" | "cancelled",
 *     "duration": 12345,  // optional, in ms
 *     "source": "claude", // optional
 *     "machineId": "xxx", // optional
 *     "metadata": {}      // optional
 *   }
 */
http.route({
  path: '/api/webhook/task',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    try {
      // Extract API key from Authorization header
      const authHeader = request.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Missing or invalid Authorization header' }),
          { status: 401, headers }
        )
      }

      const apiKey = authHeader.slice(7) // Remove "Bearer "
      if (!apiKey.startsWith('fin_')) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key format' }),
          { status: 401, headers }
        )
      }

      // Hash and validate API key
      const keyHash = await hashApiKey(apiKey)
      const apiKeyRecord = await ctx.runQuery(
        internal.apiKeysInternal.getByHash,
        {
          keyHash,
        }
      )

      if (!apiKeyRecord) {
        return new Response(JSON.stringify({ error: 'Invalid API key' }), {
          status: 401,
          headers,
        })
      }

      // Parse request body
      const body = await request.json()
      const { title, status, duration, source, machineId, metadata } = body as {
        title?: string
        status?: string
        duration?: number
        source?: string
        machineId?: string
        metadata?: Record<string, unknown>
      }

      if (!title) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: title' }),
          { status: 400, headers }
        )
      }

      const taskStatus = status || 'success'
      if (!['success', 'failure', 'cancelled'].includes(taskStatus)) {
        return new Response(
          JSON.stringify({
            error: 'Invalid status. Must be: success, failure, or cancelled',
          }),
          { status: 400, headers }
        )
      }

      // Update API key last used timestamp
      await ctx.runMutation(internal.apiKeysInternal.updateLastUsed, {
        id: apiKeyRecord._id,
      })

      // Record the task
      const taskId = await ctx.runMutation(internal.agentTasks.record, {
        userId: apiKeyRecord.userId,
        apiKeyId: apiKeyRecord._id,
        title,
        status: taskStatus,
        duration,
        source,
        machineId,
        metadata,
      })

      // Check if user has push notifications enabled
      const settings = await ctx.runQuery(internal.userSettingsInternal.get, {
        userId: apiKeyRecord.userId,
      })

      // Send push notification if enabled
      if (settings?.pushEnabled !== false) {
        try {
          await ctx.runAction(internal.agentHooks.notifyAgentCompletion, {
            userId: apiKeyRecord.userId,
            title: taskStatus === 'success' ? 'Task Completed' : 'Task Failed',
            body: title,
            url: '/dashboard',
          })
        } catch (pushError) {
          // Don't fail the request if push fails
          console.error('Push notification failed:', pushError)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          taskId,
          message: 'Task recorded successfully',
        }),
        { status: 200, headers }
      )
    } catch (error) {
      console.error('Webhook error:', error)
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers }
      )
    }
  }),
})

/**
 * Health check endpoint
 * GET /api/health
 */
http.route({
  path: '/api/health',
  method: 'GET',
  handler: httpAction((_ctx, _request) => {
    return new Response(
      JSON.stringify({ status: 'ok', timestamp: Date.now() }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }),
})

export default http
