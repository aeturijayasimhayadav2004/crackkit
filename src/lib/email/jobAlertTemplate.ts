import { JOB_DOMAINS, type DomainKey } from '@/lib/job-domains'
import { EXPERIENCE_LEVELS, type ExperienceKey } from '@/lib/experience-levels'
import type { JobListing } from '@/lib/scrapers'

export function buildJobAlertEmail(opts: {
  domains: string[]
  jobsByDomain: Record<string, JobListing[]>
  experience?: ExperienceKey
  unsubUrl: string
  date: string
}): string {
  const { domains, jobsByDomain, experience, unsubUrl, date } = opts
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crackkit.store'

  const expConfig = experience ? EXPERIENCE_LEVELS[experience] : null
  const totalJobs = Object.values(jobsByDomain).reduce((sum, j) => sum + j.length, 0)

  // Only render domains that have jobs
  const activeDomains = domains.filter((d) => (jobsByDomain[d]?.length ?? 0) > 0)

  const domainSections = activeDomains
    .map((domain) => {
      const config = JOB_DOMAINS[domain as DomainKey]
      if (!config) return ''

      const jobs = jobsByDomain[domain] ?? []

      const jobRows = jobs
        .map((job) => {
          const safeUrl = sanitizeUrl(job.url)
          return `
          <div style="background:#13131f;border:1px solid #2a2a40;border-radius:10px;padding:14px 16px;margin-bottom:10px">
            <a href="${safeUrl}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;line-height:1.4;display:block;margin-bottom:5px">${escapeHtml(job.title)}</a>
            ${job.company ? `<div style="color:#8888aa;font-size:13px;margin-bottom:8px">${escapeHtml(job.company)}</div>` : ''}
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
              <span style="font-size:11px;color:#6C5CE7;background:rgba(108,92,231,0.12);padding:2px 9px;border-radius:20px;border:1px solid rgba(108,92,231,0.25)">📍 ${escapeHtml(job.location)}</span>
              <span style="font-size:11px;color:#777;background:#0d0d18;padding:2px 9px;border-radius:20px;border:1px solid #222238">${escapeHtml(job.source)}</span>
            </div>
            <a href="${safeUrl}" style="color:#6C5CE7;font-size:13px;font-weight:600;text-decoration:none">Apply Now →</a>
          </div>`
        })
        .join('')

      return `
        <div style="margin-bottom:36px">
          <h2 style="font-size:17px;color:#6C5CE7;margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid #2a2a40">${config.label} <span style="font-size:13px;color:#555577;font-weight:400">(${jobs.length} jobs)</span></h2>
          ${jobRows}
        </div>`
    })
    .join('')

  const experienceBadge = expConfig
    ? `<span style="display:inline-block;font-size:12px;background:rgba(108,92,231,0.15);color:#9d8ff0;padding:3px 12px;border-radius:20px;border:1px solid rgba(108,92,231,0.3);margin-top:8px">${expConfig.label} · ${expConfig.description}</span>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Daily Job Alert — CrackKit</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;padding:28px 24px;background:linear-gradient(135deg,#16062e,#0d0d1e);border-radius:16px;border:1px solid #2a2a40">
      <p style="color:#6C5CE7;font-size:26px;font-weight:800;margin:0 0 6px;letter-spacing:-0.5px">⚡ CrackKit</p>
      <p style="color:#5a5a7a;font-size:13px;margin:0 0 10px">${escapeHtml(date)}</p>
      <p style="color:#e0e0f0;font-size:17px;font-weight:600;margin:0 0 4px">${totalJobs} Fresh Jobs Curated For You 🇮🇳</p>
      ${experienceBadge}
    </div>

    <!-- Job sections -->
    ${domainSections}

    <!-- CTA -->
    <div style="text-align:center;margin:28px 0;padding:20px 24px;background:#110820;border-radius:12px;border:1px solid #3a2a5e">
      <p style="color:#8888aa;font-size:14px;margin:0 0 14px">Want to ace these interviews? Get our premium study PDFs.</p>
      <a href="${appUrl}/products" style="display:inline-block;background:#6C5CE7;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px">Browse CrackKit PDFs →</a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1e1e30;margin-top:28px;padding-top:20px;text-align:center">
      <p style="color:#44445a;font-size:12px;margin:0 0 8px">You're receiving this because you purchased the Daily Job Alert Agent from CrackKit.</p>
      <a href="${unsubUrl}" style="color:#6C5CE7;font-size:12px;text-decoration:none">Unsubscribe from daily alerts</a>
    </div>

  </div>
</body>
</html>`
}

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '#'
    return parsed.href
  } catch {
    return '#'
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
