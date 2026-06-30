"use client";

import Image from "next/image";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { EmptyState } from "@/components/EmptyState";
import { PriceDisplay } from "@/components/PriceDisplay";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const remove = useWishlistStore((state) => state.remove);
  const addItem = useCartStore((state) => state.addItem);
  const [mounted, setMounted] = useState(false);

  // Persisted store hydrates on the client — render the real list only after
  // mount so the server-rendered empty state doesn't mismatch.
  useEffect(() => setMounted(true), []);

  const handleAddToCart = (item: (typeof items)[number]) => {
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      coverImage: item.coverImage,
      category: item.category,
    });
    toast.success(`${item.title} added to cart!`);
  };

  if (!mounted) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-20 min-h-[60vh]" />
      </PageTransition>
    );
  }

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-20 min-h-[60vh] flex items-center justify-center">
          <EmptyState
            title="Your wishlist is empty"
            subtitle="Tap the heart on any product to save it here for later."
            ctaText="Browse Products"
            ctaHref="/products"
            variant="wishlist"
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 min-h-[70vh]">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-badge fill-badge" />
          <h1 className="text-4xl font-bold font-syne text-white">Your Wishlist</h1>
          <span className="text-text-secondary text-lg">({items.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-surface border border-border p-4 rounded-2xl items-center relative"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0"
              >
                <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
              </Link>
              <div className="flex flex-col flex-grow min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">
                  {item.category}
                </span>
                <Link
                  href={`/products/${item.slug}`}
                  className="text-base font-bold text-white hover:text-primary transition-colors line-clamp-1 mb-1"
                >
                  {item.title}
                </Link>
                <PriceDisplay
                  originalPrice={item.originalPrice}
                  currentPrice={item.price}
                  className="mt-auto"
                />
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-10 h-10 flex items-center justify-center text-primary border border-primary/40 hover:bg-primary hover:text-white rounded-full transition-colors"
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    remove(item.id);
                    toast.success("Removed from wishlist");
                  }}
                  className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-badge hover:bg-badge/10 rounded-full transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
