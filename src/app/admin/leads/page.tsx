import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin, isAdminEmail } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import { Mail } from "lucide-react";

type Lead = { id: string; email: string; source: string; created_at: string };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const limit = 50;
  const from = (page - 1) * limit;

  const admin = supabaseAdmin();
  let leads: Lead[] = [];
  let total = 0;

  try {
    const { data, count, error } = await admin
      .from("leads")
      .select("id, email, source, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (!error) {
      leads = (data ?? []) as Lead[];
      total = count ?? 0;
    }
  } catch {
    // table not yet created — show empty state
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold font-syne text-white">Leads</h1>
        <span className="text-text-secondary">({total} total)</span>
      </div>

      {leads.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <Mail className="w-10 h-10 text-text-secondary mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No leads yet</p>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            Leads appear here once users download the free guide and the{" "}
            <code className="text-primary">leads</code> table is created in Supabase.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary border-b border-border text-left">
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium">Source</th>
                  <th className="px-4 py-4 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-background/40 transition-colors">
                    <td className="px-5 py-3 text-white font-mono text-xs">{l.email}</td>
                    <td className="px-4 py-3 text-text-secondary">{l.source}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">{formatDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-3 justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?page=${p}`}
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
