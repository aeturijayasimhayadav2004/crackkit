import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(60).optional(),
})

// The free lead-magnet PDF. Override with NEXT_PUBLIC_FREE_GUIDE_URL once a
// real guide is uploaded (e.g. a public Supabase storage URL).
const GUIDE_URL = process.env.NEXT_PUBLIC_FREE_GUIDE_URL || '/free-guide.pdf'

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
  }
  const { email, source } = parsed.data

  // Best-effort capture. If the `leads` table doesn't exist yet (SQL not run),
  // we still hand over the guide so the user-facing flow keeps working.
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await supabaseAdmin
      .from('leads')
      .upsert(
        { email: email.toLowerCase(), source: source ?? 'free-guide' },
        { onConflict: 'email', ignoreDuplicates: true }
      )
    if (error) {
      console.error('[lead] capture skipped:', error.message)
    }
  } catch (err) {
    console.error('[lead] capture error:', err)
  }

  return NextResponse.json({ ok: true, guideUrl: GUIDE_URL })
}
