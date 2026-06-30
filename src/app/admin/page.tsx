import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin, isAdminEmail } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import { Package, Users, ShoppingBag, TrendingUp, PlusCircle, Mail } from "lucide-react";

async function getStats() {
  const admin = supabaseAdmin();

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: totalPurchases },
    leadsResult,
    { data: revenue },
    { data: topProducts },
  ] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    admin.from("purchases").select("id", { count: "exact", head: true }),
    admin.from("leads").select("id", { count: "exact", head: true }).then((r) =>
      r.error?.code === "42P01" ? { count: 0 } : r
    ),
    admin.from("orders").select("amount_inr").eq("status", "paid"),
    admin
      .from("products")
      .select("id, title, total_sales, price_inr, slug")
      .order("total_sales", { ascending: false })
      .limit(5),
  ]);

  const totalRevenuePaise = (revenue ?? []).reduce(
    (sum: number, o: { amount_inr: number }) => sum + o.amount_inr,
    0
  );

  return {
    totalProducts: totalProducts ?? 0,
    totalOrders: totalOrders ?? 0,
    totalPurchases: totalPurchases ?? 0,
    totalLeads: (leadsResult as { count: number }).count ?? 0,
    totalRevenueRupees: Math.round(totalRevenuePaise / 100),
    topProducts: topProducts ?? [],
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/");

  const stats = await getStats();

  const cards = [
    { label: "Active Products", value: stats.totalProducts, icon: Package, color: "text-primary" },
    { label: "Paid Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-success" },
    { label: "Total Revenue", value: formatPrice(stats.totalRevenueRupees), icon: TrendingUp, color: "text-warning" },
    { label: "Lead Emails", value: stats.totalLeads, icon: Mail, color: "text-badge" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-syne text-white">Dashboard</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-5">
            <Icon className={`w-6 h-6 mb-3 ${color}`} />
            <div className="text-2xl font-bold font-mono text-white">{value}</div>
            <div className="text-sm text-text-secondary mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Top products */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Top Products by Sales</h2>
          <Link href="/admin/products" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </div>
        {stats.topProducts.length === 0 ? (
          <p className="text-text-secondary text-sm">No sales yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-secondary border-b border-border">
                <th className="text-left pb-3 font-medium">Product</th>
                <th className="text-right pb-3 font-medium">Sales</th>
                <th className="text-right pb-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(stats.topProducts as { id: string; title: string; total_sales: number; price_inr: number; slug: string }[]).map((p) => (
                <tr key={p.id}>
                  <td className="py-3 text-white">
                    <Link href={`/admin/products/${p.id}/edit`} className="hover:text-primary transition-colors">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 text-right font-mono text-white">{p.total_sales}</td>
                  <td className="py-3 text-right font-mono text-text-secondary">
                    {formatPrice(Math.round(p.price_inr / 100))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
