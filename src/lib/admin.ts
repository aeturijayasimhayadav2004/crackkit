import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export function supabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Supports comma-separated ADMIN_EMAIL, e.g. "a@x.com,b@x.com"
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

// Returns the admin client if the current session belongs to an admin email,
// otherwise returns a 403 NextResponse. Use at the top of every admin route.
export async function requireAdmin(): Promise<
  { admin: ReturnType<typeof supabaseAdmin>; error: null } |
  { admin: null; error: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return {
      admin: null,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { admin: supabaseAdmin(), error: null }
}
