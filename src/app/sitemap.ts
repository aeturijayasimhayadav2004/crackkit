import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/supabase/queries'

const BASE_URL = 'https://crackkit.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refund`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/shipping`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await getProducts()
    productRoutes = products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // If product fetch fails, still return static routes rather than 500 the sitemap
  }

  return [...staticRoutes, ...productRoutes]
}
