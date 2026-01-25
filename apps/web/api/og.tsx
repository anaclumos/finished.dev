import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#18181b',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
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
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#18181b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '48px',
            backgroundColor: '#09090b',
            borderRadius: '16px',
            border: '1px solid #27272a',
            overflow: 'hidden',
            flex: 1,
          }}
        >
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
                backgroundColor: '#ef4444',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#eab308',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
              }}
            />
            <span
              style={{
                marginLeft: '12px',
                fontSize: '14px',
                color: '#71717a',
              }}
            >
              Terminal
            </span>
          </div>

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
            <div
              style={{
                fontSize: '56px',
                fontWeight: 600,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              Know when your
            </div>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 600,
                color: '#a1a1aa',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              AI agents finish
            </div>
          </div>
        </div>

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
              color: '#71717a',
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
    }
  )
}
