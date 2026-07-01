import { JOB_DOMAINS, type DomainKey } from '@/lib/job-domains'
import { EXPERIENCE_LEVELS, type ExperienceKey } from '@/lib/experience-levels'

export type JobListing = {
  title: string
  company: string
  location: string
  url: string
  source: string
}

export async function scrapeJobsForDomains(
  domains: string[],
  experience: ExperienceKey = 'fresher'
): Promise<Record<string, JobListing[]>> {
  const result: Record<string, JobListing[]> = {}

  await Promise.allSettled(
    domains.map(async (domain) => {
      if (domain in JOB_DOMAINS) {
        result[domain] = await scrapeForDomain(domain as DomainKey, experience)
      }
    })
  )

  return result
}

async function scrapeForDomain(domain: DomainKey, experience: ExperienceKey): Promise<JobListing[]> {
  const config = JOB_DOMAINS[domain]
  const expConfig = EXPERIENCE_LEVELS[experience]

  const [naukri, linkedin, internshala] = await Promise.allSettled([
    scrapeNaukri(config.naukriKeyword, expConfig.naukriMin, expConfig.naukriMax),
    scrapeLinkedIn(config.searchKeyword, expConfig.linkedInFilter),
    scrapeInternshala(config.searchKeyword),
  ])

  const all: JobListing[] = []
  if (naukri.status === 'fulfilled') all.push(...naukri.value)
  if (linkedin.status === 'fulfilled') all.push(...linkedin.value)
  if (internshala.status === 'fulfilled') all.push(...internshala.value)

  const seen = new Set<string>()
  return all
    .filter((j) => {
      if (!j.title || seen.has(j.url)) return false
      seen.add(j.url)
      return true
    })
    .slice(0, 10)
}

async function scrapeNaukri(keyword: string, expMin: number, expMax: number): Promise<JobListing[]> {
  const url = `https://www.naukri.com/jobapi/v3/search?noOfResults=5&urlType=search_by_keyword&searchType=adv&src=jobsearchDesk&keyword=${encodeURIComponent(keyword)}&location=india&experienceMin=${expMin}&experienceMax=${expMax}`

  const res = await fetch(url, {
    headers: {
      appid: '109',
      systemid: '109',
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  })

  if (!res.ok) return []

  const data = (await res.json()) as {
    jobDetails?: Array<{
      title?: string
      companyName?: string
      location?: string[]
      jdURL?: string
    }>
  }

  return (data.jobDetails ?? [])
    .map((job) => ({
      title: job.title ?? '',
      company: job.companyName ?? '',
      location: job.location?.slice(0, 2).join(', ') ?? 'India',
      url: job.jdURL ? `https://www.naukri.com${job.jdURL}` : 'https://www.naukri.com',
      source: 'Naukri',
    }))
    .filter((j) => j.title)
}

async function scrapeLinkedIn(keyword: string, experienceFilter: string): Promise<JobListing[]> {
  // Try with experience filter first
  const jobs = await fetchLinkedInPage(keyword, experienceFilter)
  // If experience filter returned nothing, fall back to no filter
  if (jobs.length === 0 && experienceFilter) {
    return fetchLinkedInPage(keyword, '')
  }
  return jobs
}

async function fetchLinkedInPage(keyword: string, experienceFilter: string): Promise<JobListing[]> {
  const filterParam = experienceFilter ? `&f_E=${encodeURIComponent(experienceFilter)}` : ''
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword)}&location=India${filterParam}&start=0`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!res.ok) return []
    return parseLinkedInCards(await res.text())
  } catch {
    return []
  }
}

function parseLinkedInCards(html: string): JobListing[] {
  const jobs: JobListing[] = []
  const cardRegex = /<li[^>]*>([\s\S]*?)<\/li>/g
  let match: RegExpExecArray | null

  while ((match = cardRegex.exec(html)) !== null && jobs.length < 5) {
    const card = match[1]
    if (!card.includes('base-search-card')) continue

    const titleMatch = card.match(/base-search-card__title[^>]*>([\s\S]*?)<\/h3>/)
    const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
    if (!title) continue

    const companyMatch = card.match(/base-search-card__subtitle[\s\S]*?>([\s\S]*?)<\/(?:a|h4)>/)
    const company = companyMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''

    const locationMatch = card.match(/job-search-card__location[^>]*>([\s\S]*?)<\/span>/)
    const location = locationMatch?.[1]?.trim() ?? 'India'

    const urlMatch = card.match(/href="([^"]*jobs\/view[^"]*)"/)
    const rawUrl = urlMatch?.[1] ?? ''
    const url = rawUrl.split('?')[0]

    if (url) {
      jobs.push({ title, company, location, url, source: 'LinkedIn' })
    }
  }

  return jobs
}

async function scrapeInternshala(keyword: string): Promise<JobListing[]> {
  const slug = keyword
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  const pageUrl = `https://internshala.com/jobs/${slug}-jobs-in-india`

  try {
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!res.ok) return []

    const html = await res.text()
    const jobs: JobListing[] = []
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    let jsonMatch: RegExpExecArray | null

    while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(jsonMatch[1]) as unknown
        const listings = Array.isArray(parsed) ? parsed : [parsed]

        for (const item of listings as Record<string, unknown>[]) {
          if (item?.['@type'] === 'JobPosting' && typeof item.title === 'string') {
            const org = item.hiringOrganization as Record<string, unknown> | undefined
            jobs.push({
              title: item.title,
              company: typeof org?.name === 'string' ? org.name : '',
              location: 'India',
              url: typeof item.url === 'string' ? item.url : pageUrl,
              source: 'Internshala',
            })
          }

          if (item?.['@type'] === 'ItemList' && Array.isArray(item.itemListElement)) {
            for (const listItem of item.itemListElement as Record<string, unknown>[]) {
              if (jobs.length >= 5) break
              const title = typeof listItem.name === 'string' ? listItem.name : ''
              const jobUrl = typeof listItem.url === 'string' ? listItem.url : ''
              if (!title || !jobUrl) continue

              const slug2 = jobUrl.split('/').pop() ?? ''
              const atIdx = slug2.lastIndexOf('-at-')
              const jobInIdx = slug2.indexOf('-job-in-')

              let company = ''
              let location = 'India'

              if (atIdx > -1) {
                const companySlug = slug2.slice(atIdx + 4).replace(/\d+$/, '')
                company = companySlug
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')
                  .trim()
              }

              if (jobInIdx > -1 && atIdx > -1) {
                const locationSlug = slug2.slice(jobInIdx + 8, atIdx)
                location = locationSlug
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')
                  .trim() || 'India'
              }

              jobs.push({ title, company, location, url: jobUrl, source: 'Internshala' })
            }
          }

          if (jobs.length >= 5) break
        }
      } catch {
        // ignore malformed JSON-LD
      }
      if (jobs.length >= 5) break
    }

    return jobs
  } catch {
    return []
  }
}
