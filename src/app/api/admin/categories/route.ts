import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const { data, error: dbErr } = await admin
    .from('categories')
    .select('id, name, slug')
    .order('name')

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
