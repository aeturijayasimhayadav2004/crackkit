import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const fileSchema = z.object({
  file_path: z.string().min(1).max(500),
  display_name: z.string().min(1).max(200),
  file_size_mb: z.number().optional().nullable(),
  sort_order: z.number().int().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const { data, error: dbErr } = await admin
    .from('product_files')
    .select('*')
    .eq('product_id', id)
    .order('sort_order', { ascending: true })
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const parsed = fileSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  const { data, error: dbErr } = await admin
    .from('product_files')
    .insert({ ...parsed.data, product_id: id })
    .select()
    .single()
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
