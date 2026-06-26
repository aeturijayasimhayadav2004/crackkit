"use client";

import Image from "next/image";
import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { PriceDisplay } from "@/components/PriceDisplay";
import { DiscountBadge } from "@/components/DiscountBadge";
import { ProductCard } from "@/components/ProductCard";
import { calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { type Product } from "@/data/mockProducts";
import {
  Star,
  Zap,
  ShoppingCart,
  Lock,
  CheckCircle2,
  FileText,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [activeTab, setActiveTab] = useState("description");

  const discount = calculateDiscount(product.originalPrice, product.price);

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.title} added to cart!`);
  };

  const handleBuyNow = () => {
    addItem(product);
    toast.success(`${product.title} added to cart! Proceeding to checkout...`);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          {/* Left: Images */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface border border-border">
              <Image
                src={product.coverImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              <DiscountBadge
                discount={discount}
                className="absolute top-4 left-4 text-base px-3 py-1.5"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative aspect-video rounded-xl overflow-hidden bg-surface border border-border opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-xs font-medium">
                    Preview {i}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-primary border border-primary/30 rounded-full bg-primary/10 mb-4">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold font-syne text-white mb-4 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-1 text-warning font-medium">
                  <Star className="w-4 h-4 fill-warning" />
                  <span>4.9</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-text-secondary">2,400+ downloads</span>
              </div>

              <PriceDisplay
                originalPrice={product.originalPrice}
                currentPrice={product.price}
                className="text-4xl mb-6"
              />

              <p className="text-text-secondary text-lg mb-6 leading-relaxed">
                Master the core concepts with this comprehensive guide.
                Carefully curated to help you crack your next interview and
                upskill rapidly.
              </p>

              <div className="flex items-center gap-2 text-success font-medium mb-6 bg-success/10 border border-success/20 py-2 px-4 rounded-lg w-fit">
                <Zap className="w-5 h-5 fill-success" />
                Instant Download after payment
              </div>

              <div className="flex items-center gap-6 text-sm text-text-secondary mb-8 border-y border-border py-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> PDF Format
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />{" "}
                  {product.pages} Pages
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />{" "}
                  {product.fileSizeMb} MB
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-text-secondary bg-surface px-3 py-1 rounded-md border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-primary text-primary font-bold text-lg hover:bg-primary/10 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-colors shadow-[0_0_20px_rgba(108,92,231,0.4)]"
                >
                  <Zap className="w-5 h-5 fill-white" /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs */}
        <div className="mb-20">
          <div className="flex border-b border-border overflow-x-auto no-scrollbar mb-8">
            {["description", "includes", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-white"
                )}
              >
                {tab === "description"
                  ? "Description"
                  : tab === "includes"
                    ? "What's Included"
                    : "Reviews"}
              </button>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-8 min-h-[300px]">
            {activeTab === "description" && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-bold mb-4 font-syne">
                  About this bundle
                </h3>
                <p className="text-text-secondary leading-relaxed mb-4">
                  This {product.title} is meticulously crafted to give you the
                  edge you need in today&apos;s competitive job market. Unlike generic
                  tutorials, this PDF contains highly condensed, exam-oriented
                  material that focuses strictly on what gets asked in
                  interviews.
                </p>
                <ul className="space-y-2 text-text-secondary list-disc pl-5">
                  <li>Comprehensive coverage from basics to advanced topics.</li>
                  <li>Real-world interview questions asked at MAANG.</li>
                  <li>Clear diagrams and code snippets (where applicable).</li>
                  <li>
                    Printable, high-res PDF format for offline studying.
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "includes" && (
              <div>
                <h3 className="text-2xl font-bold mb-6 font-syne">
                  Files Included
                </h3>
                <div className="space-y-3">
                  {[
                    `📄 ${product.slug}_part1_theory.pdf`,
                    `📄 ${product.slug}_part2_questions.pdf`,
                    `📄 cheat_sheet_quick_rev.pdf`,
                  ].map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-background border border-border rounded-xl"
                    >
                      <div className="flex items-center gap-3 text-text-secondary font-mono text-sm">
                        <span>{file}</span>
                      </div>
                      <Lock className="w-4 h-4 text-primary" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-text-secondary mt-6 italic">
                  Files unlock immediately after successful payment.
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-5xl font-bold text-white">4.9</div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-warning text-warning"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-text-secondary">
                      Based on 342 reviews
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      name: "Rahul S.",
                      text: "Perfect material for my placement drive. Highly concise.",
                    },
                    {
                      name: "Sneha M.",
                      text: "The concepts are explained very simply. Better than buying heavy books.",
                    },
                    {
                      name: "Aditya V.",
                      text: "Instant delivery and great quality. Printed it out and reading daily.",
                    },
                  ].map((rev, i) => (
                    <div
                      key={i}
                      className="border-b border-border pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className="w-3 h-3 fill-warning text-warning"
                          />
                        ))}
                      </div>
                      <p className="text-white italic mb-2">
                        &ldquo;{rev.text}&rdquo;
                      </p>
                      <p className="text-sm font-bold text-text-secondary">
                        — {rev.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold font-syne text-white mb-8">
              You might also like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
