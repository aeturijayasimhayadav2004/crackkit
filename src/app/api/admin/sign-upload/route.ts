import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function POST(req: Request) {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const body = await req.json().catch(() => ({})) as { type?: string; name?: string }
  const { type, name } = body

  if (!name || (type !== 'pdf' && type !== 'cover')) {
    return NextResponse.json({ error: 'type (pdf|cover) and name required' }, { status: 400 })
  }

  const bucket = type === 'pdf' ? 'product-files' : 'product-covers'

  const { data, error: urlErr } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(name)

  if (urlErr || !data) {
    return NextResponse.json({ error: urlErr?.message ?? 'Failed to create upload URL' }, { status: 500 })
  }

  let publicUrl: string | null = null
  if (type === 'cover') {
    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(name)
    publicUrl = urlData.publicUrl
  }

  return NextResponse.json({ signedUrl: data.signedUrl, path: data.path, publicUrl })
}
