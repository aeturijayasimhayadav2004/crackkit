"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap, Heart, Star } from "lucide-react";
import { Product } from "@/data/mockProducts";
import { PriceDisplay } from "./PriceDisplay";
import { DiscountBadge } from "./DiscountBadge";
import { calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/covers/placeholder.svg";

const CATEGORY_TAG_COLORS: Record<string, string> = {
  "DSA & Algorithms":  "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Web Development":   "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "System Design":     "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "Database & SQL":    "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Interview Prep":    "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Python & ML":       "text-pink-400 bg-pink-400/10 border-pink-400/20",
};

function getStaticRating(id: string): string {
  const n = id.charCodeAt(id.length - 1);
  return (4.5 + (n % 5) * 0.1).toFixed(1);
}

function getReviewCount(id: string): number {
  const n = id.charCodeAt(0);
  return 80 + (n % 180);
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) =>
    state.items.some((i) => i.id === product.id)
  );
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.coverImage || PLACEHOLDER);
  const discount = calculateDiscount(product.originalPrice, product.price);

  const rating = getStaticRating(product.id);
  const reviewCount = getReviewCount(product.id);
  const tagColorClass = CATEGORY_TAG_COLORS[product.category] ?? "text-text-secondary bg-background border-border";

  useEffect(() => setMounted(true), []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.title} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = toggleWishlist(product);
    toast.success(saved ? "Saved to wishlist" : "Removed from wishlist");
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block relative group overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Shimmer border on hover */}
      <div
        className={cn(
          "absolute inset-0 z-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100 animate-shimmer" : "opacity-0"
        )}
      />

      {/* Inner Card */}
      <div
        className="relative z-10 m-[1px] bg-surface border border-border hover:border-primary/50 rounded-[15px] p-4 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cover image */}
        <div className="relative h-48 sm:h-64 w-full mb-4 rounded-xl overflow-hidden bg-background">
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgSrc(PLACEHOLDER)}
          />
          <DiscountBadge discount={discount} className="absolute top-2 left-2 z-10" />

          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={mounted && isWishlisted}
            className={cn(
              "absolute top-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-all",
              mounted && isWishlisted
                ? "bg-badge/20 border-badge text-badge"
                : "bg-background/70 border-border text-text-secondary hover:text-white hover:border-text-secondary"
            )}
          >
            <Heart className={cn("w-4 h-4", mounted && isWishlisted && "fill-badge")} />
          </button>
        </div>

        <div className="flex flex-col flex-grow">
          {/* Category pill */}
          <span className="text-xs font-semibold text-primary border border-primary/30 rounded-full px-2 py-1 self-start mb-2 bg-primary/5">
            {product.category}
          </span>

          {/* Title */}
          <h3 className="text-lg font-bold text-white line-clamp-2 mb-2 leading-tight">
            {product.title}
          </h3>

          {/* Star rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i <= Math.round(parseFloat(rating))
                      ? "fill-warning text-warning"
                      : "fill-border text-border"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-warning">{rating}</span>
            <span className="text-xs text-text-secondary">({reviewCount})</span>
          </div>

          {/* Category-colored tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded border font-medium",
                  tagColorClass
                )}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="text-xs text-text-secondary mb-4 flex items-center gap-1.5">
            <span>📄 PDF</span>
            <span>·</span>
            <span>{product.pages} pages</span>
            <span>·</span>
            <span>{product.fileSizeMb} MB</span>
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <PriceDisplay originalPrice={product.originalPrice} currentPrice={product.price} className="mb-3" />

            <div className="flex items-center gap-1 text-xs font-medium text-success mb-3">
              <Zap className="w-3.5 h-3.5 fill-success" />
              Instant Download
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 rounded-lg border border-primary text-primary font-semibold text-sm transition-all hover:bg-primary hover:text-white"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
