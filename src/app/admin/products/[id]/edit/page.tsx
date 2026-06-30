import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin, isAdminEmail } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AdminDeleteProduct } from "@/components/admin/AdminDeleteProduct";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  category_id: string | null;
  price_inr: number;
  original_price_inr: number | null;
  cover_image_url: string | null;
  file_path: string;
  file_size_mb: number | null;
  pages: number | null;
  tags: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  difficulty_level: string | null;
  language: string | null;
  preview_url: string | null;
  total_sales: number;
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/");

  const admin = supabaseAdmin();
  const [{ data: product }, { data: categories }, { data: productFiles }] = await Promise.all([
    admin.from("products").select("*").eq("id", id).single(),
    admin.from("categories").select("id, name, slug").order("name"),
    admin.from("product_files").select("*").eq("product_id", id).order("sort_order", { ascending: true }),
  ]);

  if (!product) notFound();
  const p = product as ProductRow;

  const initialData = {
    title: p.title,
    slug: p.slug,
    description: p.description ?? "",
    long_description: p.long_description ?? "",
    category_id: p.category_id ?? "",
    price_inr: String(Math.round(p.price_inr / 100)),
    original_price_inr: p.original_price_inr ? String(Math.round(p.original_price_inr / 100)) : "",
    cover_image_url: p.cover_image_url ?? "",
    file_path: p.file_path,
    file_size_mb: p.file_size_mb ? String(p.file_size_mb) : "",
    pages: p.pages ? String(p.pages) : "",
    tags: (p.tags ?? []).join(", "),
    is_active: p.is_active,
    is_featured: p.is_featured,
    difficulty_level: p.difficulty_level ?? "Intermediate",
    language: p.language ?? "English",
    preview_url: p.preview_url ?? "",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <AdminDeleteProduct id={id} title={p.title} />
      </div>

      <div className="flex items-baseline gap-4 mb-8">
        <h1 className="text-3xl font-bold font-syne text-white">{p.title}</h1>
        <span className="text-text-secondary text-sm font-mono">
          {formatPrice(Math.round(p.price_inr / 100))} · {p.total_sales} sales
        </span>
      </div>

      <ProductForm
        categories={categories ?? []}
        initialData={initialData}
        existingFiles={productFiles ?? []}
        productId={id}
        isEdit
      />
    </div>
  );
}
