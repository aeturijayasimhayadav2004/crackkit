"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Product } from "@/data/mockProducts";
import { PriceDisplay } from "./PriceDisplay";
import { DiscountBadge } from "./DiscountBadge";
import { calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isHovered, setIsHovered] = useState(false);
  const discount = calculateDiscount(product.originalPrice, product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <Link href={`/products/${product.slug}`} className="block relative group overflow-hidden rounded-2xl">
      {/* Animated shimmer border effect on hover */}
      <div 
        className={cn(
          "absolute inset-0 z-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100 animate-shimmer" : "opacity-0"
        )}
      />
      
      {/* Inner Card Content */}
      <div 
        className="relative z-10 m-[1px] bg-surface border border-border hover:border-primary/50 rounded-[15px] p-4 flex flex-col h-full transition-colors duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square w-full mb-4 rounded-xl overflow-hidden bg-background">
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <DiscountBadge discount={discount} className="absolute top-2 left-2 z-10" />
        </div>

        <div className="flex flex-col flex-grow">
          <span className="text-xs font-semibold text-primary border border-primary/30 rounded-full px-2 py-1 self-start mb-2 bg-primary/5">
            {product.category}
          </span>
          
          <h3 className="text-lg font-bold text-white line-clamp-2 mb-2 leading-tight">
            {product.title}
          </h3>

          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-text-secondary bg-background px-2 py-0.5 rounded border border-border">
                {tag}
              </span>
            ))}
          </div>

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
