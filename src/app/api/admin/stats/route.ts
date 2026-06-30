import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: totalPurchases },
    { count: totalLeads },
    { data: revenue },
    { data: topProducts },
  ] = await Promise.all([
    admin.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
    admin.from('purchases').select('id', { count: 'exact', head: true }),
    // leads table may not exist yet — swallow error
    admin.from('leads').select('id', { count: 'exact', head: true }).then((r) => r.count !== undefined ? r : { count: 0, data: null, error: null }),
    admin.from('orders').select('amount_inr').eq('status', 'paid'),
    admin
      .from('products')
      .select('id, title, total_sales, price_inr')
      .order('total_sales', { ascending: false })
      .limit(5),
  ])

  const totalRevenuePaise = (revenue ?? []).reduce(
    (sum: number, o: { amount_inr: number }) => sum + o.amount_inr,
    0
  )

  return NextResponse.json({
    totalProducts: totalProducts ?? 0,
    totalOrders: totalOrders ?? 0,
    totalPurchases: totalPurchases ?? 0,
    totalLeads: totalLeads ?? 0,
    totalRevenueRupees: Math.round(totalRevenuePaise / 100),
    topProducts: topProducts ?? [],
  })
}
