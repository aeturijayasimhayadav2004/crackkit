import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.vercel.app' },
    ],
  },
  async headers() {
    // Content-Security-Policy. Static (header-based) so no per-request nonce —
    // Next's inline hydration bootstrap therefore needs 'unsafe-inline' on
    // script-src. Even so, this still blocks injected external scripts,
    // clickjacking, and unexpected network/frame egress. Allowlist origins:
    //  - checkout.razorpay.com / *.razorpay.com — payment modal (Razorpay's
    //    documented CSP requirements)
    //  - *.supabase.co (+ wss) — auth, data, realtime
    //  - *.vercel.app — product/cover images
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://*.vercel.app https://*.razorpay.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ')

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
    ]
    return [
      // Apply baseline security headers site-wide
      { source: '/:path*', headers: securityHeaders },
    ]
  },
}

export default nextConfig
