import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin, isAdminEmail } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Pencil } from "lucide-react";
import { AdminProductToggle } from "@/components/admin/AdminProductToggle";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  price_inr: number;
  is_active: boolean;
  is_featured: boolean;
  total_sales: number;
  categories: { name: string }[] | { name: string } | null;
};

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/");

  const admin = supabaseAdmin();
  const { data: products } = await admin
    .from("products")
    .select("id, title, slug, price_inr, is_active, is_featured, total_sales, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-syne text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-secondary border-b border-border text-left">
              <th className="px-5 py-4 font-medium">Title</th>
              <th className="px-3 py-4 font-medium">Category</th>
              <th className="px-3 py-4 font-medium text-right">Price</th>
              <th className="px-3 py-4 font-medium text-right">Sales</th>
              <th className="px-3 py-4 font-medium text-center">Active</th>
              <th className="px-3 py-4 font-medium text-center">Featured</th>
              <th className="px-4 py-4 font-medium text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {((products as unknown as ProductRow[]) ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-background/40 transition-colors">
                <td className="px-5 py-4">
                  <Link
                    href={`/products/${p.slug}`}
                    target="_blank"
                    className="text-white hover:text-primary transition-colors font-medium line-clamp-1"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-3 py-4 text-text-secondary">
                  {Array.isArray(p.categories) ? (p.categories[0]?.name ?? "—") : (p.categories?.name ?? "—")}
                </td>
                <td className="px-3 py-4 text-right font-mono text-white">
                  {formatPrice(Math.round(p.price_inr / 100))}
                </td>
                <td className="px-3 py-4 text-right font-mono text-white">{p.total_sales}</td>
                <td className="px-3 py-4 text-center">
                  <AdminProductToggle id={p.id} field="is_active" value={p.is_active} />
                </td>
                <td className="px-3 py-4 text-center">
                  <AdminProductToggle id={p.id} field="is_featured" value={p.is_featured} />
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover text-xs font-semibold"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(products ?? []).length === 0 && (
          <div className="text-center py-16 text-text-secondary">No products yet.</div>
        )}
      </div>
    </div>
  );
}
