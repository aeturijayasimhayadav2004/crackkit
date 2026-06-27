import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const receivedSig = req.headers.get('x-razorpay-signature') ?? ''

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  const sigOk =
    expectedSig.length === receivedSig.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(receivedSig))

  if (!sigOk) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody) as {
    event: string
    payload: { payment: { entity: { id: string; order_id: string; amount: number } } }
  }

  if (body.event === 'payment.captured') {
    const payment = body.payload.payment.entity
    const razorpayOrderId = payment.order_id

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, amount_inr')
      .eq('razorpay_order_id', razorpayOrderId)
      .single()

    if (!order) {
      // 200 so Razorpay stops retrying an order we don't recognise
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Guard against amount tampering — paid amount must match what we charged
    const ord0 = order as { id: string; user_id: string; amount_inr: number }
    if (payment.amount !== ord0.amount_inr) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: payment.id,
        razorpay_signature: receivedSig,
      })
      .eq('id', ord0.id)

    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('product_id')
      .eq('order_id', ord0.id)

    for (const item of (items ?? []) as { product_id: string }[]) {
      await supabaseAdmin.from('purchases').upsert(
        {
          user_id: ord0.user_id,
          product_id: item.product_id,
          order_id: ord0.id,
        },
        { onConflict: 'user_id,product_id', ignoreDuplicates: true }
      )
    }
  }

  // Always return 200 fast — Razorpay retries if it does not get 200
  return NextResponse.json({ received: true }, { status: 200 })
}
