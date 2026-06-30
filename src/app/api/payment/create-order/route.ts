import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'
import { z } from 'zod'
import { isWelcomeCoupon, applyWelcomeDiscountPaise, WELCOME_COUPON } from '@/lib/coupons'

const schema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(50),
  coupon: z.string().max(40).optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.email === 'guest@crackkit.dev') {
    return NextResponse.json({ error: 'Guest users cannot purchase' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { productIds, coupon } = parsed.data

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Rate limit: cap order-creation spam per user. Reuses the orders table
  // (no extra infra). 10 orders / 10 min is generous for real buyers but
  // stops scripted abuse from flooding Razorpay + our DB with pending orders.
  const tenMinutesAgo = new Date(Date.now() - 600000).toISOString()
  const { count: recentOrders } = await supabaseAdmin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', tenMinutesAgo)

  if ((recentOrders ?? 0) >= 10) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes and try again.' },
      { status: 429 }
    )
  }

  const { data: products, error: prodError } = await supabaseAdmin
    .from('products')
    .select('id, price_inr')
    .in('id', productIds)
    .eq('is_active', true)

  if (prodError || !products || products.length !== productIds.length) {
    return NextResponse.json({ error: 'Products not found' }, { status: 400 })
  }

  const { data: existingPurchases } = await supabaseAdmin
    .from('purchases')
    .select('product_id')
    .eq('user_id', user.id)
    .in('product_id', productIds)

  if (existingPurchases && existingPurchases.length > 0) {
    return NextResponse.json(
      { error: 'Already purchased', productId: existingPurchases[0].product_id },
      { status: 400 }
    )
  }

  const subtotalPaise = (products as { id: string; price_inr: number }[]).reduce(
    (sum, p) => sum + p.price_inr,
    0
  )

  // Coupon: WELCOME10 = 10% off, first purchase only. Re-validated here so the
  // charged amount can never be tampered with from the client. order.amount_inr
  // is what the webhook/verify checks the paid amount against.
  let totalPaise = subtotalPaise
  let appliedCoupon: string | null = null
  if (coupon && isWelcomeCoupon(coupon)) {
    const { count: priorPurchases } = await supabaseAdmin
      .from('purchases')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((priorPurchases ?? 0) === 0) {
      totalPaise = applyWelcomeDiscountPaise(subtotalPaise)
      appliedCoupon = WELCOME_COUPON
    }
  }

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const order = await razorpay.orders.create({
    amount: totalPaise,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: { userId: user.id, productIds: productIds.join(','), coupon: appliedCoupon ?? '' },
  })

  const { data: dbOrder, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount_inr: totalPaise,
      status: 'pending',
    })
    .select('id')
    .single()

  if (orderError || !dbOrder) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const orderItems = (products as { id: string; price_inr: number }[]).map((p) => ({
    order_id: (dbOrder as { id: string }).id,
    product_id: p.id,
    price_inr: p.price_inr,
  }))
  await supabaseAdmin.from('order_items').insert(orderItems)

  return NextResponse.json({
    razorpayOrderId: order.id,
    orderId: (dbOrder as { id: string }).id,
    amount: totalPaise,
    subtotal: subtotalPaise,
    coupon: appliedCoupon,
    currency: 'INR',
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}
