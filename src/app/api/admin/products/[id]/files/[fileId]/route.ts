import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { admin, error } = await requireAdmin()
  if (error) return error
  const { id, fileId } = await params
  const { error: dbErr } = await admin
    .from('product_files')
    .delete()
    .eq('id', fileId)
    .eq('product_id', id)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
