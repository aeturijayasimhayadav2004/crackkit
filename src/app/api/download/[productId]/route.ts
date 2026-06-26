import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.email === 'guest@crackkit.dev') {
    return NextResponse.json({ error: 'Guests cannot download' }, { status: 403 })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: purchase } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase required' }, { status: 403 })
  }

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const { count } = await supabaseAdmin
    .from('download_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .gte('downloaded_at', oneHourAgo)

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('file_path')
    .eq('id', productId)
    .single()

  if (!(product as { file_path?: string } | null)?.file_path) {
    return NextResponse.json({ error: 'Product not found' }, { status: 500 })
  }

  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from('product-files')
    .createSignedUrl((product as { file_path: string }).file_path, 60)

  if (signedError || !signedData) {
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  await supabaseAdmin.from('download_logs').insert({
    user_id: user.id,
    product_id: productId,
    ip_address: ip,
  })

  return NextResponse.redirect(signedData.signedUrl)
}
