import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin, isAdminEmail } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/");

  const admin = supabaseAdmin();
  const { data: categories } = await admin.from("categories").select("id, name, slug").order("name");

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      <h1 className="text-3xl font-bold font-syne text-white mb-8">Add New Product</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
