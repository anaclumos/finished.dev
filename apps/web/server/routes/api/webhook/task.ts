import { defineEventHandler, readBody, getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const convexUrl = process.env.VITE_CONVEX_URL

  if (!convexUrl) {
    throw createError({ statusCode: 500, message: 'Server configuration error' })
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

    const data = await response.json()

    if (!response.ok) {
      throw createError({ statusCode: response.status, data })
    }

    return data
  } catch (error) {
    if ((error as any).statusCode) throw error
    console.error('Failed to proxy to Convex:', error)
    throw createError({ statusCode: 502, message: 'Failed to connect to backend' })
  }
})
