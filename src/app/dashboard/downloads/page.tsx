import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { DownloadButton } from "@/components/DownloadButton";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/admin";
import { getProducts, getUserPurchases } from "@/lib/supabase/queries";
import { Calendar, FileText, Package, CheckCircle2, Mail, Briefcase } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { EXPERIENCE_LEVELS, type ExperienceKey } from "@/lib/experience-levels";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type ProductFile = {
  id: string;
  product_id: string;
  file_path: string;
  display_name: string;
  file_size_mb: number | null;
  sort_order: number;
};

export default async function DownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [allProducts, purchasedIds] = await Promise.all([
    getProducts(),
    getUserPurchases(user.id),
  ]);

  const purchasedSet = new Set(purchasedIds);
  const purchasedProducts = allProducts.filter((p) => purchasedSet.has(p.id));
  const unpurchasedProducts = allProducts.filter((p) => !purchasedSet.has(p.id));

  // Fetch job agent subscription if the user purchased it
  let agentSubscription: { domains: string[]; experience: ExperienceKey } | null = null
  const hasAgentProduct = purchasedProducts.some((p) => p.slug === 'job-alert-agent')
  if (hasAgentProduct) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: subData } = await adminClient
      .from('job_agent_subscriptions')
      .select('domains, experience')
      .eq('user_id', user.id)
      .eq('active', true)
      .maybeSingle()
    if (subData) {
      agentSubscription = {
        domains: subData.domains as string[],
        experience: (subData.experience ?? 'fresher') as ExperienceKey,
      }
    }
  }

  // Fetch additional files for purchased products
  let filesByProduct = new Map<string, ProductFile[]>();
  if (purchasedIds.length > 0) {
    const admin = supabaseAdmin();
    const { data: productFiles } = await admin
      .from("product_files")
      .select("*")
      .in("product_id", purchasedIds)
      .order("sort_order", { ascending: true });

    for (const file of (productFiles ?? []) as ProductFile[]) {
      const list = filesByProduct.get(file.product_id) ?? [];
      list.push(file);
      filesByProduct.set(file.product_id, list);
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[70vh]">
        <h1 className="text-4xl font-bold font-syne text-white mb-12">My Downloads</h1>

        {/* Purchased */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-border pb-4">
            Your Purchases
          </h2>

          {purchasedProducts.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-2xl">
              <Package className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <p className="text-white font-semibold text-lg mb-2">No purchases yet</p>
              <p className="text-text-secondary text-sm mb-6">
                Your purchased PDFs will appear here after checkout.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {purchasedProducts.map((product) => {
                const extraFiles = filesByProduct.get(product.id) ?? [];
                const hasMultipleFiles = extraFiles.length > 0;

                return (
                  <div
                    key={product.id}
                    className="bg-surface border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-background flex-shrink-0 shadow-lg">
                      <Image
                        src={product.coverImage}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col flex-grow w-full min-w-0">
                      <span className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-text-secondary mb-5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(new Date().toISOString())}
                        </span>
                        {product.pages && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {product.pages} Pages
                          </span>
                        )}
                        {hasMultipleFiles && (
                          <span className="flex items-center gap-1 text-primary">
                            <Package className="w-3.5 h-3.5" />
                            {extraFiles.length + 1} files included
                          </span>
                        )}
                      </div>

                      {product.slug === 'job-alert-agent' ? (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span className="text-green-400 font-semibold text-sm">Agent Activated</span>
                          </div>
                          <div className="flex items-start gap-2 text-text-secondary text-sm">
                            <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                            <span>You will receive emails with fresh Indian job openings at <span className="text-white font-medium">8:00 AM every morning</span>. Jobs are auto-curated from LinkedIn and Internshala based on your profile.</span>
                          </div>
                          {agentSubscription && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                                <Briefcase className="w-3 h-3" />
                                {EXPERIENCE_LEVELS[agentSubscription.experience].label}
                              </div>
                              {agentSubscription.domains.map((d) => (
                                <div key={d} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-surface border border-border text-text-secondary">
                                  {d === 'tech' ? 'Tech / Software' : 'Design / Creative'}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : hasMultipleFiles ? (
                        <div className="flex flex-col gap-2">
                          <DownloadButton
                            productId={product.id}
                            productTitle={product.title}
                            isPurchased={true}
                            label="Primary PDF"
                          />
                          {extraFiles.map((file) => (
                            <DownloadButton
                              key={file.id}
                              productId={product.id}
                              productTitle={file.display_name}
                              isPurchased={true}
                              fileId={file.id}
                              label={file.display_name}
                            />
                          ))}
                        </div>
                      ) : (
                        <DownloadButton
                          productId={product.id}
                          productTitle={product.title}
                          isPurchased={true}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Explore More */}
        {unpurchasedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-border pb-4">
              Explore More
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {unpurchasedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-surface border border-border rounded-xl p-4 flex flex-col h-full"
                >
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-background mb-4">
                    <Image
                      src={product.coverImage}
                      alt={product.title}
                      fill
                      className="object-cover opacity-50 grayscale"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 flex-grow">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
                    <span className="font-mono font-bold text-white">
                      {formatPrice(product.price)}
                    </span>
                    <DownloadButton
                      productId={product.id}
                      productTitle={product.title}
                      isPurchased={false}
                      product={{
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        coverImage: product.coverImage,
                        category: product.category,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
