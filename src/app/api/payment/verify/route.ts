import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { z } from 'zod'

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

export async function POST(req: Request) {
  // 1. Must be a logged-in, non-guest user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email === 'guest@crackkit.dev') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validate body shape
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data

  // 3. Verify Razorpay payment signature (timing-safe)
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  const sigOk =
    expectedSig.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(razorpay_signature))

  if (!sigOk) {
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 4. Load the order and confirm it belongs to this user
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, status')
    .eq('razorpay_order_id', razorpay_order_id)
    .single()

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }
  const ord = order as { id: string; user_id: string; status: string }
  if (ord.user_id !== user.id) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // 5. Mark paid + store payment reference (idempotent — safe if webhook already ran)
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      razorpay_payment_id,
      razorpay_signature,
    })
    .eq('id', ord.id)

  // 6. Grant purchases now so downloads work even if the webhook is delayed
  //    or unreachable (e.g. localhost). Webhook does the same upsert — duplicates ignored.
  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('product_id')
    .eq('order_id', ord.id)

  for (const item of (items ?? []) as { product_id: string }[]) {
    await supabaseAdmin.from('purchases').upsert(
      {
        user_id: ord.user_id,
        product_id: item.product_id,
        order_id: ord.id,
      },
      { onConflict: 'user_id,product_id', ignoreDuplicates: true }
    )
  }

  return NextResponse.json({ success: true })
}
