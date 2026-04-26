import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a2f5a 0%, #243f78 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #c8932a',
        }}
      >
        <span
          style={{
            color: '#c8932a',
            fontWeight: 900,
            fontSize: 20,
            fontFamily: 'sans-serif',
            letterSpacing: -0.5,
            lineHeight: 1,
          }}
        >
          L2L
        </span>
      </div>
    ),
    { ...size }
  )
}
