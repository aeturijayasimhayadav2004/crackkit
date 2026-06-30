import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = 50
  const from = (page - 1) * limit

  const { data, count, error: dbErr } = await admin
    .from('leads')
    .select('id, email, source, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (dbErr) {
    // Table may not exist yet
    if (dbErr.code === '42P01') return NextResponse.json({ leads: [], total: 0 })
    return NextResponse.json({ error: dbErr.message }, { status: 500 })
  }

  return NextResponse.json({ leads: data ?? [], total: count ?? 0 })
}
