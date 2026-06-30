import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import { scrapeJobsForDomains } from '@/lib/scrapers'
import { buildJobAlertEmail } from '@/lib/email/jobAlertTemplate'
import { format } from 'date-fns'

export const maxDuration = 60

type Subscription = {
  user_id: string
  email: string
  domains: string[]
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.JOB_AGENT_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const dryRun = searchParams.get('dry_run') === '1'

  if (!dryRun && !process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY not configured' },
      { status: 500 }
    )
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subs, error } = await supabaseAdmin
    .from('job_agent_subscriptions')
    .select('user_id, email, domains')
    .eq('active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const subscriptions = (subs ?? []) as Subscription[]

  // dry_run with ?test_domains=tech,design scrapes without needing real subscriptions
  if (subscriptions.length === 0 && !dryRun) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No active subscriptions' })
  }

  const testDomains = dryRun
    ? (searchParams.get('test_domains') ?? 'tech,design').split(',').filter(Boolean)
    : []

  // Scrape once per unique domain (shared across subscribers)
  const uniqueDomains = [
    ...new Set([...subscriptions.flatMap((s) => s.domains), ...testDomains]),
  ]
  const jobsByDomain = await scrapeJobsForDomains(uniqueDomains)

  const resend = dryRun ? null : new Resend(process.env.RESEND_API_KEY!)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crackkit.store'
  const date = format(new Date(), 'MMMM d, yyyy')

  let sent = 0
  const failed: string[] = []

  for (const sub of subscriptions) {
    try {
      // Build per-user domain→jobs map
      const userJobsByDomain: Record<string, (typeof jobsByDomain)[string]> = {}
      for (const domain of sub.domains) {
        userJobsByDomain[domain] = jobsByDomain[domain] ?? []
      }

      const totalJobs = Object.values(userJobsByDomain).reduce(
        (sum, jobs) => sum + jobs.length,
        0
      )

      // Skip email if no jobs found for this user's domains
      if (totalJobs === 0) continue

      const unsubToken = crypto
        .createHash('sha256')
        .update(sub.user_id + (process.env.JOB_AGENT_SECRET ?? ''))
        .digest('hex')
        .slice(0, 32)

      const unsubUrl = `${appUrl}/api/job-agent/unsubscribe?uid=${sub.user_id}&token=${unsubToken}`

      const html = buildJobAlertEmail({
        domains: sub.domains,
        jobsByDomain: userJobsByDomain,
        unsubUrl,
        date,
      })

      if (!dryRun && resend) {
        await resend.emails.send({
          from: 'CrackKit Jobs <jobs@crackkit.store>',
          to: sub.email,
          subject: `⚡ ${totalJobs} Fresh Indian Jobs For You — ${date}`,
          html,
        })
      }

      sent++
    } catch {
      failed.push(sub.email)
    }
  }

  if (dryRun && subscriptions.length === 0) {
    return NextResponse.json({ ok: true, dry_run: true, jobs: jobsByDomain })
  }

  return NextResponse.json({
    ok: true,
    sent,
    total: subscriptions.length,
    ...(dryRun && { dry_run: true, jobs: jobsByDomain }),
    ...(failed.length > 0 && { failed }),
  })
}
