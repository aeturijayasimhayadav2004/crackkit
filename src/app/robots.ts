import type { MetadataRoute } from 'next'

const BASE_URL = 'https://crackkit.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep private/transactional areas out of search results
      disallow: ['/dashboard/', '/checkout/', '/cart', '/auth/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
