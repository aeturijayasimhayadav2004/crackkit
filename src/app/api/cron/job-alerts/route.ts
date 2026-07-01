import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import { scrapeJobsForDomains } from '@/lib/scrapers'
import { buildJobAlertEmail } from '@/lib/email/jobAlertTemplate'
import { type ExperienceKey } from '@/lib/experience-levels'
import { format } from 'date-fns'

export const maxDuration = 60

type Subscription = {
  user_id: string
  email: string
  domains: string[]
  experience: ExperienceKey
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  // Auth: Vercel auto-cron sends its CRON_SECRET header; manual calls use ?secret param
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
    .select('user_id, email, domains, experience')
    .eq('active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const subscriptions = (subs ?? []).map((s) => ({
    ...s,
    experience: (s.experience ?? 'fresher') as ExperienceKey,
  })) as Subscription[]

  // dry_run with ?test_domains=tech,design scrapes without needing real subscriptions
  if (subscriptions.length === 0 && !dryRun) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No active subscriptions' })
  }

  const testDomains = dryRun
    ? (searchParams.get('test_domains') ?? 'tech,design').split(',').filter(Boolean)
    : []
  const testExperience = (searchParams.get('test_experience') ?? 'fresher') as ExperienceKey

  // Scrape once per unique (domain, experience) pair to avoid redundant requests
  type ScrapeCacheKey = string // `${domain}:${experience}`
  const scrapeCache = new Map<ScrapeCacheKey, ReturnType<typeof scrapeJobsForDomains>>()

  const getJobs = (domains: string[], experience: ExperienceKey) => {
    const key = `${domains.sort().join(',')}:${experience}`
    if (!scrapeCache.has(key)) {
      scrapeCache.set(key, scrapeJobsForDomains(domains, experience))
    }
    return scrapeCache.get(key)!
  }

  // Kick off all unique scrape combos in parallel
  const scrapePromises: Promise<void>[] = []

  if (dryRun) {
    scrapePromises.push(getJobs(testDomains, testExperience).then(() => undefined))
  } else {
    // Group subscriptions by experience to minimise scrape calls
    const byExperience = new Map<ExperienceKey, Set<string>>()
    for (const sub of subscriptions) {
      if (!byExperience.has(sub.experience)) byExperience.set(sub.experience, new Set())
      for (const d of sub.domains) byExperience.get(sub.experience)!.add(d)
    }
    for (const [exp, domainSet] of byExperience) {
      scrapePromises.push(getJobs([...domainSet], exp).then(() => undefined))
    }
  }

  await Promise.all(scrapePromises)

  const resend = dryRun ? null : new Resend(process.env.RESEND_API_KEY!)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crackkit.store'
  const date = format(new Date(), 'MMMM d, yyyy')

  // Handle dry_run with no real subscriptions
  if (dryRun && subscriptions.length === 0) {
    const jobs = await getJobs(testDomains, testExperience)
    return NextResponse.json({ ok: true, dry_run: true, jobs })
  }

  let sent = 0
  const failed: string[] = []

  for (const sub of subscriptions) {
    try {
      const jobsByDomain = await getJobs(sub.domains, sub.experience)

      const userJobsByDomain: Record<string, (typeof jobsByDomain)[string]> = {}
      for (const domain of sub.domains) {
        userJobsByDomain[domain] = jobsByDomain[domain] ?? []
      }

      const totalJobs = Object.values(userJobsByDomain).reduce(
        (sum, jobs) => sum + jobs.length,
        0
      )

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

  return NextResponse.json({
    ok: true,
    sent,
    total: subscriptions.length,
    ...(dryRun && { dry_run: true }),
    ...(failed.length > 0 && { failed }),
  })
}
