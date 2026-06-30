import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required for SSR auth to work
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /dashboard/* routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Guest users cannot access dashboard
    if (user.email === 'guest@crackkit.dev') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signup'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // Protect /admin/* — only the ADMIN_EMAIL account may access
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

// Only run on routes that actually need a verified session. Public/cacheable
// pages (home, products, etc.) skip the per-request Supabase Auth round-trip,
// which keeps the site fast and cheap under heavy traffic. API routes do their
// own auth checks internally.
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
