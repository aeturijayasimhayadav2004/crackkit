import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { DownloadButton } from "@/components/DownloadButton";
import { createClient } from "@/lib/supabase/server";
import { getProducts, getUserPurchases } from "@/lib/supabase/queries";
import { Calendar, FileText, Package } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purchasedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-surface border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-background flex-shrink-0 shadow-lg">
                    <Image
                      src={product.coverImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-grow w-full">
                    <span className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-text-secondary mb-6">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(new Date().toISOString())}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {product.pages} Pages
                      </span>
                    </div>
                    <DownloadButton
                      productId={product.id}
                      productTitle={product.title}
                      isPurchased={true}
                    />
                  </div>
                </div>
              ))}
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
