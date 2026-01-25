import satori from 'satori'
import sharp from 'sharp'
import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const svg = await satori(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#18181b',
        padding: '60px',
        fontFamily: 'sans-serif',
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
            fontSize: '24px',
          }}
        >
          🔔
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
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [],
    }
  )

  const png = await sharp(Buffer.from(svg)).png().toBuffer()

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return png
})
