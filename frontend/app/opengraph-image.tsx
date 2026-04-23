import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'LIFTED TO LIFT — Blessed to be a Blessing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a2f5a 0%, #243f78 50%, #1a2f5a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 400,
            fontWeight: 900,
            color: 'rgba(255,255,255,0.04)',
            lineHeight: 1,
          }}
        >
          L2L
        </div>

        {/* Gold accent top */}
        <div style={{ width: 80, height: 6, background: '#c8932a', borderRadius: 3, marginBottom: 40 }} />

        {/* Logo circle */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c8932a, #e0b050)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 30,
          }}
        >
          <span style={{ color: '#1a2f5a', fontWeight: 900, fontSize: 28 }}>L2L</span>
        </div>

        {/* Title */}
        <div style={{ color: 'white', fontSize: 64, fontWeight: 900, letterSpacing: -1, textAlign: 'center' }}>
          LIFTED TO LIFT
        </div>

        {/* Tagline */}
        <div style={{ color: '#c8932a', fontSize: 28, fontWeight: 600, marginTop: 16, letterSpacing: 4, textTransform: 'uppercase' }}>
          Blessed to be a Blessing
        </div>

        {/* Description */}
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20, marginTop: 24, textAlign: 'center', maxWidth: 700 }}>
          Transforming lives through education, empowerment, and community stewardship in Kenya.
        </div>

        {/* Gold accent bottom */}
        <div style={{ width: 80, height: 6, background: '#c8932a', borderRadius: 3, marginTop: 40 }} />

        {/* URL */}
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, marginTop: 20 }}>
          liftedtolift.org
        </div>
      </div>
    ),
    { ...size }
  )
}
