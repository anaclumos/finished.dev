import { createFileRoute } from '@tanstack/react-router'
import { ImageResponse } from '@vercel/og'

// Load Figtree font from Google Fonts
async function loadFont(
  font: string,
  weight: number = 400
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`
  const css = await (await fetch(url)).text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (resource?.[1]) {
    const response = await fetch(resource[1])
    if (response.status === 200) {
      return await response.arrayBuffer()
    }
  }

  throw new Error(`Failed to load font: ${font}`)
}

export const Route = createFileRoute('/api/og')({
  server: {
    handlers: {
      GET: async () => {
    try {
      // Load Figtree font (matching the app's typography)
      const [fontSemibold, fontRegular] = await Promise.all([
        loadFont('Figtree', 600),
        loadFont('Figtree', 400),
      ])

      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#18181b', // zinc-900
              padding: '60px',
              fontFamily: 'Figtree',
            }}
          >
            {/* Header with logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {/* Logo box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                }}
              >
                {/* Bell icon (simplified) */}
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <title>Notification bell</title>
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                finished.dev
              </span>
            </div>

            {/* Terminal window */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '48px',
                backgroundColor: '#09090b', // zinc-950
                borderRadius: '16px',
                border: '1px solid #27272a', // zinc-800
                overflow: 'hidden',
                flex: 1,
              }}
            >
              {/* Terminal header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 20px',
                  borderBottom: '1px solid #27272a',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444', // red-500
                  }}
                />
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#eab308', // yellow-500
                  }}
                />
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e', // green-500
                  }}
                />
                <span
                  style={{
                    marginLeft: '12px',
                    fontSize: '14px',
                    color: '#71717a', // zinc-500
                  }}
                >
                  Terminal
                </span>
              </div>

              {/* Terminal content */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  padding: '40px',
                }}
              >
                <h1
                  style={{
                    fontSize: '56px',
                    fontWeight: 600,
                    color: '#ffffff',
                    margin: 0,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  Know when your
                </h1>
                <h1
                  style={{
                    fontSize: '56px',
                    fontWeight: 600,
                    color: '#a1a1aa', // zinc-400
                    margin: 0,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  AI agents finish
                </h1>
              </div>
            </div>

            {/* Footer tagline */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '32px',
              }}
            >
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 400,
                  color: '#71717a', // zinc-500
                }}
              >
                Stop watching terminals. Get instant push notifications.
              </span>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: 'Figtree',
              data: fontSemibold,
              weight: 600,
              style: 'normal',
            },
            {
              name: 'Figtree',
              data: fontRegular,
              weight: 400,
              style: 'normal',
            },
          ],
        }
      )
    } catch (e) {
      console.error('OG Image generation failed:', e)
      return new Response('Failed to generate image', { status: 500 })
    }
  },
    },
  },
})
