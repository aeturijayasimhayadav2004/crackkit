import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  description: z.string().max(500).optional(),
  long_description: z.string().max(5000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  price_inr: z.number().int().min(100),
  original_price_inr: z.number().int().min(100).optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  file_path: z.string().min(1).max(500),
  file_size_mb: z.number().optional().nullable(),
  pages: z.number().int().optional().nullable(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  difficulty_level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().nullable(),
  language: z.string().optional(),
  preview_url: z.string().optional().nullable(),
})

export async function GET() {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const { data, error: dbErr } = await admin
    .from('products')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data, error: dbErr } = await admin
    .from('products')
    .insert(parsed.data)
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
