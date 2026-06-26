import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabaseAdmin
    .from('orders')
    .update({ status: 'paid' })
    .eq('razorpay_order_id', razorpay_order_id)

  return NextResponse.json({ success: true })
}
