import { defineEventHandler, setHeader } from 'h3'
import satori from 'satori'
import sharp from 'sharp'

const fontPromise = fetch(
  'https://cdn.jsdelivr.net/fontsource/fonts/figtree@latest/latin-400-normal.ttf'
).then((res) => res.arrayBuffer())

const fontBoldPromise = fetch(
  'https://cdn.jsdelivr.net/fontsource/fonts/figtree@latest/latin-600-normal.ttf'
).then((res) => res.arrayBuffer())

const logoPromise = fetch('https://finished.dev/logo.png')
  .then((res) => res.arrayBuffer())
  .then((buf) => `data:image/png;base64,${Buffer.from(buf).toString('base64')}`)

export default defineEventHandler(async (event) => {
  const [fontData, fontBoldData, logoBase64] = await Promise.all([
    fontPromise,
    fontBoldPromise,
    logoPromise,
  ])

  const svg = await satori(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1c1206',
        padding: '60px',
        fontFamily: 'Figtree',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0px',
        }}
      >
        <img
          alt="finished.dev logo"
          height={80}
          src={logoBase64}
          style={{
            borderRadius: '16px',
          }}
          width={80}
        />
        <span
          style={{
            fontSize: '52px',
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
          marginTop: '32px',
          backgroundColor: '#18181b',
          borderRadius: '16px',
          border: '1px solid #3f3f46',
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
            borderBottom: '1px solid #3f3f46',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
            }}
          />
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#eab308',
            }}
          />
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
            }}
          />
          <span
            style={{
              marginLeft: '12px',
              fontSize: '22px',
              color: '#a1a1aa',
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
              fontSize: '72px',
              fontWeight: 600,
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Phone Push Notifications
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 600,
              color: '#fbbf24',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            When Agents Finish
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '28px',
        }}
      >
        <span
          style={{
            fontSize: '32px',
            fontWeight: 400,
            color: '#fde68a',
          }}
        >
          Phone Push Notifications the Moment Agents Finish.
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Figtree',
          data: fontData,
          weight: 400,
          style: 'normal' as const,
        },
        {
          name: 'Figtree',
          data: fontBoldData,
          weight: 600,
          style: 'normal' as const,
        },
      ],
    }
  )

  const png = await sharp(Buffer.from(svg)).png().toBuffer()

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return png
})
