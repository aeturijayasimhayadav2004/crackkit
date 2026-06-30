import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'
import { Resend } from 'resend'

const schema = z.object({
  productTitle: z.string().min(1),
  productSlug: z.string().min(1),
  description: z.string().optional(),
  priceRupees: z.number().int().min(1),
})

export async function POST(req: Request) {
  const { admin, error } = await requireAdmin()
  if (error) return error

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { productTitle, productSlug, description, priceRupees } = parsed.data

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: 'RESEND_API_KEY not configured. Add it in Vercel env to enable emails.',
    })
  }

  // Fetch all lead emails
  const { data: leads, error: dbErr } = await admin
    .from('leads')
    .select('email')
  if (dbErr) {
    if (dbErr.code === '42P01') {
      return NextResponse.json({ ok: false, skipped: true, reason: 'leads table not created yet.' })
    }
    return NextResponse.json({ error: dbErr.message }, { status: 500 })
  }

  const emails = (leads ?? []).map((l: { email: string }) => l.email)
  if (emails.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No leads to notify.' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crackkit.vercel.app'
  const productUrl = `${appUrl}/products/${productSlug}`

  // Send in batches of 50 (Resend to: array limit)
  const batchSize = 50
  let sent = 0
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    await resend.emails.send({
      from: `CrackKit <onboarding@resend.dev>`,
      to: batch,
      subject: `🔥 New Drop: ${productTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;background:#0D0D14;color:#fff;border-radius:16px">
          <h1 style="color:#6C5CE7;font-size:24px;margin-bottom:8px">⚡ CrackKit</h1>
          <h2 style="font-size:20px;margin-bottom:12px">New Drop: ${productTitle}</h2>
          ${description ? `<p style="color:#A0A0B0;margin-bottom:16px">${description}</p>` : ''}
          <p style="font-size:22px;font-weight:bold;color:#fff;margin-bottom:20px">Only ₹${priceRupees.toLocaleString('en-IN')}</p>
          <a href="${productUrl}" style="display:inline-block;background:#6C5CE7;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:bold">
            Check it out →
          </a>
          <hr style="border:1px solid #1E1E2E;margin:28px 0">
          <p style="font-size:11px;color:#555">You received this because you downloaded a free guide from CrackKit. <a href="${appUrl}" style="color:#6C5CE7">Unsubscribe</a></p>
        </div>
      `,
    })
    sent += batch.length
  }

  return NextResponse.json({ ok: true, sent })
}
