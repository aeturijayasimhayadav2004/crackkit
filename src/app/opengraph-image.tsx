import { ImageResponse } from 'next/og'

export const alt = 'CrackKit — Crack Every Interview. Master Every Skill.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0F',
          backgroundImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(108,92,231,0.35) 0%, transparent 70%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 96, fontWeight: 800 }}>
          <span style={{ color: '#6C5CE7', marginRight: 16 }}>⚡</span>
          <span>CrackKit</span>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 40,
            color: '#B8BCD0',
            textAlign: 'center',
          }}
        >
          Crack Every Interview. Master Every Skill.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 28,
            color: '#6C5CE7',
            border: '2px solid rgba(108,92,231,0.4)',
            borderRadius: 16,
            padding: '12px 28px',
          }}
        >
          Premium Study PDFs · Instant Download
        </div>
      </div>
    ),
    { ...size }
  )
}
