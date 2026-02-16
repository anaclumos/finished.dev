import { defineEventHandler, toRequest } from 'h3'
import { auth } from '@/lib/auth'

export default defineEventHandler(async (event) => {
  const request = toRequest(event)
  const response = await auth.handler(request)

  return response
})
