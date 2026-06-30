import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

// Accepts multipart/form-data with:
//   file   — the binary file
//   type   — 'pdf' | 'cover'
//   name   — desired storage object name (e.g. "dsa-bundle.pdf")
//
// PDFs go into the private 'product-files' bucket.
// Cover images go into the public 'product-covers' bucket.

export async function POST(req: Request) {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null
  const name = formData.get('name') as string | null

  if (!file || !type || !name) {
    return NextResponse.json({ error: 'file, type, and name are required.' }, { status: 400 })
  }
  if (type !== 'pdf' && type !== 'cover') {
    return NextResponse.json({ error: 'type must be pdf or cover.' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const bucket = type === 'pdf' ? 'product-files' : 'product-covers'
  const contentType = type === 'pdf' ? 'application/pdf' : file.type || 'image/jpeg'

  const { data, error: upErr } = await admin.storage
    .from(bucket)
    .upload(name, buffer, {
      contentType,
      upsert: true,
    })

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  // For cover images, return the public URL directly.
  // For PDFs, return just the storage path (signed URLs are generated at download time).
  if (type === 'cover') {
    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(data.path)
    return NextResponse.json({ path: data.path, url: urlData.publicUrl })
  }

  return NextResponse.json({ path: data.path })
}
