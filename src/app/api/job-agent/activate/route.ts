import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const AGENT_SLUG = 'job-alert-agent'

const schema = z.object({
  domains: z.array(z.enum(['tech', 'design'])).min(1).max(2),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email === 'guest@crackkit.dev') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid domains' }, { status: 400 })
  }

  const { domains } = parsed.data

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify agent product exists
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('slug', AGENT_SLUG)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Agent product not found' }, { status: 404 })
  }

  // Verify user purchased it
  const { data: purchase } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', (product as { id: string }).id)
    .maybeSingle()

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase required' }, { status: 403 })
  }

  // Upsert subscription
  const { error } = await supabaseAdmin
    .from('job_agent_subscriptions')
    .upsert(
      {
        user_id: user.id,
        email: user.email!,
        domains,
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
