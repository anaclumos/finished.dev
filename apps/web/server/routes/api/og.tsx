import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import satori from 'satori'
import sharp from 'sharp'
import { defineEventHandler, setHeader } from 'h3'

const fontPromise = fetch(
  'https://cdn.jsdelivr.net/fontsource/fonts/figtree@latest/latin-400-normal.ttf'
).then((res) => res.arrayBuffer())

const fontBoldPromise = fetch(
  'https://cdn.jsdelivr.net/fontsource/fonts/figtree@latest/latin-600-normal.ttf'
).then((res) => res.arrayBuffer())

export default defineEventHandler(async (event) => {
  const [fontData, fontBoldData] = await Promise.all([fontPromise, fontBoldPromise])

  const logoPath = join(process.cwd(), 'public', 'logo.png')
  const logoBuffer = readFileSync(logoPath)
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`

  const svg = await satori(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0d9488',
        padding: '60px',
        fontFamily: 'Figtree',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <img
          src={logoBase64}
          width={56}
          height={56}
          style={{
            borderRadius: '12px',
          }}
        />
        <span
          style={{
            fontSize: '32px',
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
          marginTop: '40px',
          backgroundColor: '#042f2e',
          borderRadius: '16px',
          border: '1px solid #134e4a',
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
            borderBottom: '1px solid #134e4a',
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
              color: '#5eead4',
            }}
          >
            ./finished
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
              color: '#99f6e4',
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
            color: '#ccfbf1',
          }}
        >
          Stop watching terminals. Get instant push notifications.
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Figtree', data: fontData, weight: 400, style: 'normal' as const },
        { name: 'Figtree', data: fontBoldData, weight: 600, style: 'normal' as const },
      ],
    }
  )

  const png = await sharp(Buffer.from(svg)).png().toBuffer()

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return png
})
