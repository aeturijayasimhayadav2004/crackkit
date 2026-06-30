import { JOB_DOMAINS, type DomainKey } from '@/lib/job-domains'
import type { JobListing } from '@/lib/scrapers'

export function buildJobAlertEmail(opts: {
  domains: string[]
  jobsByDomain: Record<string, JobListing[]>
  unsubUrl: string
  date: string
}): string {
  const { domains, jobsByDomain, unsubUrl, date } = opts
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crackkit.store'

  const domainSections = domains
    .map((domain) => {
      const config = JOB_DOMAINS[domain as DomainKey]
      if (!config) return ''

      const jobs = jobsByDomain[domain] ?? []

      if (jobs.length === 0) {
        return `
          <div style="margin-bottom:32px">
            <h2 style="font-size:17px;color:#6C5CE7;margin:0 0 8px">${config.icon} ${config.label}</h2>
            <p style="color:#666;font-size:14px;margin:0">No new jobs found today. We'll keep searching!</p>
          </div>`
      }

      const jobRows = jobs
        .map(
          (job) => `
          <div style="background:#13131f;border:1px solid #2a2a40;border-radius:10px;padding:14px 16px;margin-bottom:10px">
            <a href="${escapeAttr(job.url)}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;line-height:1.4;display:block;margin-bottom:5px">${escapeHtml(job.title)}</a>
            ${job.company ? `<div style="color:#8888aa;font-size:13px;margin-bottom:8px">${escapeHtml(job.company)}</div>` : ''}
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
              <span style="font-size:11px;color:#6C5CE7;background:rgba(108,92,231,0.12);padding:2px 9px;border-radius:20px;border:1px solid rgba(108,92,231,0.25)">📍 ${escapeHtml(job.location)}</span>
              <span style="font-size:11px;color:#777;background:#0d0d18;padding:2px 9px;border-radius:20px;border:1px solid #222238">${escapeHtml(job.source)}</span>
            </div>
            <a href="${escapeAttr(job.url)}" style="color:#6C5CE7;font-size:13px;font-weight:600;text-decoration:none">Apply Now →</a>
          </div>`
        )
        .join('')

      return `
        <div style="margin-bottom:36px">
          <h2 style="font-size:17px;color:#6C5CE7;margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid #2a2a40">${config.icon} ${config.label}</h2>
          ${jobRows}
        </div>`
    })
    .join('')

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
      <p style="color:#e0e0f0;font-size:17px;font-weight:600;margin:0">Your Daily Job Digest 🇮🇳</p>
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
