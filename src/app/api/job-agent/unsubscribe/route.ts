import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crackkit.store'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  if (!uid || !token || token.length !== 32) {
    return new Response(errorPage('Invalid unsubscribe link.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const expected = crypto
    .createHash('sha256')
    .update(uid + (process.env.JOB_AGENT_SECRET ?? ''))
    .digest('hex')
    .slice(0, 32)

  if (expected !== token) {
    return new Response(errorPage('Unsubscribe link expired or invalid.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabaseAdmin
    .from('job_agent_subscriptions')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('user_id', uid)

  return new Response(successPage(), {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })
}

function successPage(): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Unsubscribed</title></head>
<body style="margin:0;background:#0a0a0f;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="text-align:center;padding:40px;max-width:400px">
    <p style="font-size:40px;margin:0 0 16px">✓</p>
    <h1 style="color:#6C5CE7;font-size:24px;margin:0 0 12px">Unsubscribed</h1>
    <p style="color:#8888aa;margin:0 0 24px">You've been removed from daily job alerts.</p>
    <a href="${APP_URL}" style="color:#6C5CE7;text-decoration:none;font-weight:600">Return to CrackKit →</a>
  </div>
</body></html>`
}

function errorPage(msg: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Error</title></head>
<body style="margin:0;background:#0a0a0f;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="text-align:center;padding:40px;max-width:400px">
    <p style="color:#ff6b6b;font-size:24px;margin:0 0 12px">⚠ Error</p>
    <p style="color:#8888aa;margin:0 0 24px">${msg}</p>
    <a href="${APP_URL}" style="color:#6C5CE7;text-decoration:none;font-weight:600">Return to CrackKit →</a>
  </div>
</body></html>`
}
