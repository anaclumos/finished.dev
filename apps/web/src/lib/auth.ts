import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { Resend } from 'resend'
import { db } from './db'
import { schema } from './schema'

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail({ user, url }) {
      resend.emails.send({
        from: 'finished.dev <this@is.finished.dev>',
        to: [user.email],
        subject: 'Verify your email address',
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="color: #fff; font-size: 24px; margin-bottom: 16px;">Verify your email</h1>
  <p style="color: #a3a3a3; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Click the button below to verify your email address and get started with finished.dev.</p>
  <a href="${url}" style="display: inline-block; background: #fff; color: #000; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;">Verify Email</a>
  <p style="color: #525252; font-size: 13px; margin-top: 32px;">If you didn't create an account, you can safely ignore this email.</p>
</div>`,
      })
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
  plugins: [tanstackStartCookies()],
})
