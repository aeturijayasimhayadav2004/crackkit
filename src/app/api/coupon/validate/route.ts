import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { isWelcomeCoupon, WELCOME_COUPON, WELCOME_DISCOUNT_PCT } from '@/lib/coupons'

const schema = z.object({ code: z.string().min(1).max(40) })

// Validates a coupon for the current user. Used by the checkout "Apply" button
// for instant feedback — create-order re-validates server-side before charging.
export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email === 'guest@crackkit.dev') {
    return NextResponse.json(
      { valid: false, error: 'Please sign in to use a coupon.' },
      { status: 401 }
    )
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: 'Invalid coupon.' }, { status: 400 })
  }

  if (!isWelcomeCoupon(parsed.data.code)) {
    return NextResponse.json({ valid: false, error: 'This coupon code is not valid.' })
  }

  // WELCOME10 is first-purchase only.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { count } = await supabaseAdmin
    .from('purchases')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) > 0) {
    return NextResponse.json({
      valid: false,
      error: 'WELCOME10 is only valid on your first purchase.',
    })
  }

  return NextResponse.json({
    valid: true,
    code: WELCOME_COUPON,
    discountPct: WELCOME_DISCOUNT_PCT,
  })
}
