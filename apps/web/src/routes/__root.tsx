import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ConvexClerkProvider } from '../providers/convex-clerk-provider'

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
        title: 'finished.dev - Know when your AI agents finish',
      },
      {
        name: 'description',
        content: 'Stop watching terminals. Get instant push notifications when your AI agents, builds, or background tasks complete.',
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
        content: 'finished.dev - Know when your AI agents finish',
      },
      {
        property: 'og:description',
        content: 'Stop watching terminals. Get instant push notifications when your AI agents, builds, or background tasks complete.',
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
        content: 'finished.dev - Know when your AI agents finish',
      },
      {
        name: 'twitter:description',
        content: 'Stop watching terminals. Get instant push notifications when your AI agents, builds, or background tasks complete.',
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
        <ConvexClerkProvider>{children}</ConvexClerkProvider>
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
