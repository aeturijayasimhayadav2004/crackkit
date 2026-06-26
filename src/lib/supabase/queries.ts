import { createClient } from './server'
import { mockProducts, type Product } from '@/data/mockProducts'

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ─── Raw Supabase row types ────────────────────────────────────────────────

type SupabaseProductRow = {
  id: string
  title: string
  slug: string
  description: string | null
  price_inr: number
  original_price_inr: number | null
  cover_image_url: string | null
  preview_url: string | null
  file_size_mb: number | null
  pages: number | null
  tags: string[] | null
  is_featured: boolean
  total_sales: number
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | null
  language: string | null
  categories: { name: string; slug: string } | null
}

export type Review = {
  id: string
  productId: string
  userId: string
  rating: number
  body: string | null
  isVerifiedPurchase: boolean
  createdAt: string
}

// ─── Normalise Supabase row → Product ─────────────────────────────────────

function normalize(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.categories?.name ?? 'Uncategorized',
    price: Math.round(row.price_inr / 100),
    originalPrice: row.original_price_inr
      ? Math.round(row.original_price_inr / 100)
      : Math.round(row.price_inr / 100),
    coverImage: row.cover_image_url ?? '/covers/placeholder.svg',
    pages: row.pages ?? 0,
    fileSizeMb: row.file_size_mb ?? 0,
    tags: row.tags ?? [],
    description: row.description ?? undefined,
    difficultyLevel: row.difficulty_level ?? 'Intermediate',
    language: row.language ?? 'English',
    previewUrl: row.preview_url ?? undefined,
    totalSales: row.total_sales,
    isFeatured: row.is_featured,
  }
}

const PRODUCT_SELECT = '*, categories(name, slug)'

// ─── Query helpers ─────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return mockProducts

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error || !data) return mockProducts
  return (data as SupabaseProductRow[]).map(normalize)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return mockProducts.filter((_, i) => i < 3)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('total_sales', { ascending: false })

  if (error || !data) return mockProducts.filter((_, i) => i < 3)
  return (data as SupabaseProductRow[]).map(normalize)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured)
    return mockProducts.find((p) => p.slug === slug) ?? null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data)
    return mockProducts.find((p) => p.slug === slug) ?? null

  return normalize(data as SupabaseProductRow)
}

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  if (!isSupabaseConfigured)
    return mockProducts.filter(
      (p) => p.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
    )

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .order('total_sales', { ascending: false })

  if (error || !data) return []
  return (data as SupabaseProductRow[]).map(normalize)
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, product_id, user_id, rating, body, is_verified_purchase, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((r) => ({
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    rating: r.rating,
    body: r.body,
    isVerifiedPurchase: r.is_verified_purchase,
    createdAt: r.created_at,
  }))
}

export async function getUserPurchases(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .select('product_id')
    .eq('user_id', userId)

  if (error || !data) return []
  return data.map((row: { product_id: string }) => row.product_id)
}

export async function checkUserOwnsProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()

  return !error && !!data
}
