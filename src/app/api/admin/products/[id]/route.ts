import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  long_description: z.string().max(5000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  price_inr: z.number().int().min(100).optional(),
  original_price_inr: z.number().int().min(100).optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  file_path: z.string().min(1).max(500).optional(),
  file_size_mb: z.number().optional().nullable(),
  pages: z.number().int().optional().nullable(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  difficulty_level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().nullable(),
  language: z.string().optional(),
  preview_url: z.string().optional().nullable(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const parsed = updateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data, error: dbErr } = await admin
    .from('products')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  // Fetch slug before deleting so we can revalidate the product detail page
  const { data: product } = await admin
    .from('products')
    .select('slug')
    .eq('id', id)
    .single()

  // Cascade-clean rows that lack DB-level ON DELETE CASCADE
  await Promise.all([
    admin.from('download_logs').delete().eq('product_id', id),
    admin.from('product_files').delete().eq('product_id', id),
    admin.from('purchases').delete().eq('product_id', id),
    admin.from('order_items').delete().eq('product_id', id),
  ])

  const { error: dbErr } = await admin.from('products').delete().eq('id', id)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  // Bust Next.js / Vercel edge cache so user portal reflects deletion immediately
  revalidatePath('/', 'layout')
  revalidatePath('/products')
  if (product?.slug) revalidatePath(`/products/${product.slug}`)

  return NextResponse.json({ ok: true })
}
