import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import { scrapeJobsForDomains, type JobListing } from '@/lib/scrapers'
import { buildJobAlertEmail } from '@/lib/email/jobAlertTemplate'
import { EXPERIENCE_LEVELS, type ExperienceKey } from '@/lib/experience-levels'
import { format } from 'date-fns'

export const maxDuration = 60

// Max parallel Resend calls — stays within rate limits
const EMAIL_CONCURRENCY = 10

type Subscription = {
  user_id: string
  email: string
  domains: string[]
  experience: ExperienceKey
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const authHeader = req.headers.get('authorization')
  const authParam = searchParams.get('secret')
  const vercelCronSecret = process.env.CRON_SECRET
  const manualSecret = process.env.JOB_AGENT_SECRET
  const authorized =
    (vercelCronSecret && authHeader === `Bearer ${vercelCronSecret}`) ||
    (manualSecret && authParam === manualSecret)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun = searchParams.get('dry_run') === '1'

  if (!dryRun && !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subs, error: dbError } = await supabaseAdmin
    .from('job_agent_subscriptions')
    .select('user_id, email, domains, experience')
    .eq('active', true)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  const subscriptions = (subs ?? []).map((s) => ({
    ...s,
    experience: (s.experience ?? 'fresher') as ExperienceKey,
  })) as Subscription[]

  // dry_run: scrape test combo and return results without sending email
  if (dryRun) {
    const testDomains = (searchParams.get('test_domains') ?? 'tech,design').split(',').filter(Boolean)
    const testExperience = (searchParams.get('test_experience') ?? 'fresher') as ExperienceKey
    const jobs = await scrapeJobsForDomains(testDomains, testExperience)
    return NextResponse.json({ ok: true, dry_run: true, jobs, subscriptions: subscriptions.length })
  }

  if (subscriptions.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No active subscriptions' })
  }

  // ── Scrape once per unique (experience → all domains for that experience) ──
  // Group all domains by experience level to avoid duplicate scraping
  const domainsByExperience = new Map<ExperienceKey, Set<string>>()
  for (const sub of subscriptions) {
    if (!domainsByExperience.has(sub.experience)) {
      domainsByExperience.set(sub.experience, new Set())
    }
    for (const d of sub.domains) domainsByExperience.get(sub.experience)!.add(d)
  }

  // Parallel scrape — one Promise per experience level
  const resultsByExperience = new Map<ExperienceKey, Record<string, JobListing[]>>()
  await Promise.allSettled(
    [...domainsByExperience.entries()].map(async ([exp, domainSet]) => {
      const jobs = await scrapeJobsForDomains([...domainSet], exp)
      resultsByExperience.set(exp, jobs)
    })
  )

  // ── Send emails in parallel batches ──
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crackkit.store'
  const date = format(new Date(), 'MMMM d, yyyy')

  let sent = 0
  const failed: string[] = []

  // Process in batches for concurrency control
  for (let i = 0; i < subscriptions.length; i += EMAIL_CONCURRENCY) {
    const batch = subscriptions.slice(i, i + EMAIL_CONCURRENCY)

    const results = await Promise.allSettled(
      batch.map(async (sub) => {
        const allJobsForExp = resultsByExperience.get(sub.experience) ?? {}

        // Build per-user domain→jobs map, skip domains with 0 jobs
        const userJobsByDomain: Record<string, JobListing[]> = {}
        for (const domain of sub.domains) {
          const jobs = allJobsForExp[domain] ?? []
          if (jobs.length > 0) userJobsByDomain[domain] = jobs
        }

        const totalJobs = Object.values(userJobsByDomain).reduce(
          (sum, jobs) => sum + jobs.length,
          0
        )

        // Don't email if nothing scraped for this user
        if (totalJobs === 0) return

        const unsubToken = crypto
          .createHash('sha256')
          .update(sub.user_id + (process.env.JOB_AGENT_SECRET ?? ''))
          .digest('hex')
          .slice(0, 32)

        const unsubUrl = `${appUrl}/api/job-agent/unsubscribe?uid=${sub.user_id}&token=${unsubToken}`

        const html = buildJobAlertEmail({
          domains: Object.keys(userJobsByDomain),
          jobsByDomain: userJobsByDomain,
          experience: sub.experience,
          unsubUrl,
          date,
        })

        await resend.emails.send({
          from: 'CrackKit Jobs <jobs@crackkit.store>',
          to: sub.email,
          subject: `⚡ ${totalJobs} Fresh Indian Jobs For You — ${date}`,
          html,
        })
      })
    )

    for (let j = 0; j < results.length; j++) {
      if (results[j].status === 'fulfilled') {
        sent++
      } else {
        failed.push(batch[j].email)
      }
    }
  }

  // ── Admin summary email ──
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const scraperSummary = [...resultsByExperience.entries()]
      .map(([exp, jobs]) => {
        const expLabel = EXPERIENCE_LEVELS[exp].label
        const domainLines = Object.entries(jobs)
          .map(([d, jlist]) => `${d}: ${jlist.length} jobs`)
          .join(', ')
        return `${expLabel} → ${domainLines || 'none'}`
      })
      .join('<br>')

    await resend.emails.send({
      from: 'CrackKit System <jobs@crackkit.store>',
      to: adminEmail,
      subject: `[CrackKit Cron] ${date} — ${sent}/${subscriptions.length} emails sent`,
      html: `
        <p><strong>Daily Job Alert Cron Report</strong></p>
        <p>Date: ${date}</p>
        <p>Subscribers: ${subscriptions.length}</p>
        <p>Emails sent: ${sent}</p>
        <p>Failed: ${failed.length}${failed.length > 0 ? ` (${failed.join(', ')})` : ''}</p>
        <hr>
        <p><strong>Jobs scraped:</strong><br>${scraperSummary}</p>
      `,
    }).catch(() => {/* non-critical — don't fail cron if admin email fails */})
  }

  return NextResponse.json({
    ok: true,
    sent,
    total: subscriptions.length,
    ...(failed.length > 0 && { failed }),
  })
}
