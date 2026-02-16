import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '../providers/auth-provider'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'finished.dev - Phone Push Notifications When Agents Finish',
      },
      {
        name: 'description',
        content:
          'Get Phone Push Notifications When Your Agents, Builds, or Background Tasks Complete.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://finished.dev',
      },
      {
        property: 'og:title',
        content: 'finished.dev - Phone Push Notifications When Agents Finish',
      },
      {
        property: 'og:description',
        content:
          'Get Phone Push Notifications When Your Agents, Builds, or Background Tasks Complete.',
      },
      {
        property: 'og:image',
        content: 'https://finished.dev/api/og',
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'finished.dev - Phone Push Notifications When Agents Finish',
      },
      {
        name: 'twitter:description',
        content:
          'Get Phone Push Notifications When Your Agents, Builds, or Background Tasks Complete.',
      },
      {
        name: 'twitter:image',
        content: 'https://finished.dev/api/og',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
