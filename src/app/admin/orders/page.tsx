import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin, isAdminEmail } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

type Order = {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount_inr: number;
  status: string;
  created_at: string;
  user_id: string;
};

type OrderItem = {
  order_id: string;
  price_inr: number;
  products: { title: string; slug: string }[] | { title: string; slug: string } | null;
};

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  failed: "bg-badge/10 text-badge border-badge/30",
  refunded: "bg-border text-text-secondary border-border",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/");

  const { page: pageStr, status: statusFilter } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const limit = 50;
  const from = (page - 1) * limit;

  const admin = supabaseAdmin();

  let query = admin
    .from("orders")
    .select(
      "id, razorpay_order_id, razorpay_payment_id, amount_inr, status, created_at, user_id",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: rawOrders, count } = await query;
  const orders = (rawOrders ?? []) as Order[];

  let profileMap = new Map<string, Profile>();
  let itemsByOrder = new Map<string, OrderItem[]>();

  if (orders.length > 0) {
    const userIds = [...new Set(orders.map((o) => o.user_id))];
    const orderIds = orders.map((o) => o.id);

    const [{ data: profiles }, { data: orderItems }] = await Promise.all([
      admin.from("profiles").select("id, email, full_name").in("id", userIds),
      admin
        .from("order_items")
        .select("order_id, price_inr, products(title, slug)")
        .in("order_id", orderIds),
    ]);

    profileMap = new Map((profiles ?? []).map((p: Profile) => [p.id, p]));

    for (const item of (orderItems ?? []) as unknown as OrderItem[]) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }
  }

  const totalPages = Math.ceil((count ?? 0) / limit);
  const total = count ?? 0;

  // Revenue of paid orders on this page
  const paidRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amount_inr, 0);

  const TABS = [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
  ];
  const activeTab = statusFilter ?? "all";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold font-syne text-white">Orders</h1>
        <span className="text-text-secondary">({total} total)</span>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/orders" : `?status=${tab.value}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              activeTab === tab.value
                ? "bg-primary border-primary text-white"
                : "border-border text-text-secondary hover:text-white hover:border-text-secondary"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-text-secondary mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No orders yet</p>
          <p className="text-sm text-text-secondary">Orders will appear here once customers make purchases.</p>
        </div>
      ) : (
        <>
          {activeTab === "paid" && (
            <div className="bg-surface border border-border rounded-xl p-4 mb-6 inline-flex items-center gap-3">
              <span className="text-text-secondary text-sm">Page revenue:</span>
              <span className="text-success font-bold font-mono">
                {formatPrice(Math.round(paidRevenue / 100))}
              </span>
            </div>
          )}

          <div className="bg-surface border border-border rounded-2xl overflow-x-auto mb-6">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-text-secondary border-b border-border text-left">
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-3 py-4 font-medium">Customer</th>
                  <th className="px-3 py-4 font-medium">Items</th>
                  <th className="px-3 py-4 font-medium text-right">Amount</th>
                  <th className="px-3 py-4 font-medium text-center">Status</th>
                  <th className="px-4 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const profile = profileMap.get(order.user_id);
                  const items = itemsByOrder.get(order.id) ?? [];
                  return (
                    <tr key={order.id} className="hover:bg-background/40 transition-colors">
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-white">
                          {order.id.slice(0, 8)}…
                        </span>
                        {order.razorpay_payment_id && (
                          <p className="text-[10px] text-text-secondary font-mono mt-0.5 truncate max-w-[120px]">
                            {order.razorpay_payment_id}
                          </p>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-4">
                        <p className="text-white text-xs truncate max-w-[160px]">
                          {profile?.email ?? order.user_id.slice(0, 8) + "…"}
                        </p>
                        {profile?.full_name && (
                          <p className="text-[10px] text-text-secondary truncate max-w-[160px]">
                            {profile.full_name}
                          </p>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-3 py-4 max-w-[220px]">
                        {items.length === 0 ? (
                          <span className="text-text-secondary text-xs">—</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {items.map((item, i) => {
                              const title = Array.isArray(item.products)
                                ? item.products[0]?.title
                                : (item.products as { title: string } | null)?.title;
                              return (
                                <span key={i} className="text-xs text-text-secondary truncate">
                                  {title ?? "Unknown product"}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-4 text-right font-mono text-white font-medium">
                        {formatPrice(Math.round(order.amount_inr / 100))}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            STATUS_STYLES[order.status] ?? STATUS_STYLES.refunded
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-right text-xs text-text-secondary whitespace-nowrap">
                        {fmtDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-3 justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${statusFilter ? `status=${statusFilter}&` : ""}page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    p === page
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-text-secondary hover:text-white"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
