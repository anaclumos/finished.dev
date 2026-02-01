import { defineEventHandler, getHeader, HTTPError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const convexUrl =
    import.meta.env?.VITE_CONVEX_URL ?? process.env.VITE_CONVEX_URL

  if (!convexUrl) {
    throw new HTTPError('Server configuration error', { status: 500 })
  }

  // Convex HTTP routes are on .convex.site, not .convex.cloud
  const convexHttpUrl = convexUrl.replace('.convex.cloud', '.convex.site')

  const body = await readBody(event)
  const authHeader = getHeader(event, 'authorization')

  try {
    const response = await fetch(`${convexHttpUrl}/api/webhook/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    return new Response(text, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof HTTPError) {
      throw error
    }
    console.error('Failed to proxy to Convex:', error)
    throw new HTTPError('Failed to connect to backend', { status: 502 })
  }
})
