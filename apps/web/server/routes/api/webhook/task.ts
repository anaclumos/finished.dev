import { defineEventHandler, getHeader, HTTPError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  // Convex provides two URLs:
  // - VITE_CONVEX_URL: websocket/query endpoint (often *.convex.cloud, but can be a custom domain)
  // - VITE_CONVEX_SITE_URL: HTTP routes endpoint (*.convex.site)
  // When using a custom domain for VITE_CONVEX_URL, we must not try to "replace" to get the site URL.
  const convexSiteUrl =
    import.meta.env?.VITE_CONVEX_SITE_URL ?? process.env.VITE_CONVEX_SITE_URL
  const convexUrl =
    import.meta.env?.VITE_CONVEX_URL ?? process.env.VITE_CONVEX_URL

  const convexHttpUrl =
    convexSiteUrl ||
    (convexUrl ? convexUrl.replace('.convex.cloud', '.convex.site') : undefined)

  if (!convexHttpUrl) {
    throw new HTTPError('Server configuration error', { status: 500 })
  }

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
