"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Sparkles, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryPill } from "@/components/CategoryPill";
import { type Product } from "@/data/mockProducts";

const CATEGORIES = [
  "All",
  "DSA & Algorithms",
  "Web Development",
  "System Design",
  "Database & SQL",
  "Interview Prep",
  "Python & ML",
];

interface HomeProductsSectionProps {
  products: Product[];
}

function HorizontalRow({
  products,
  icon,
  title,
  accentClass,
}: {
  products: Product[];
  icon: React.ReactNode;
  title: string;
  accentClass: string;
}) {
  if (products.length === 0) return null;
  return (
    <div className="mb-10 text-left">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`flex items-center gap-2 text-lg font-bold font-syne ${accentClass}`}>
          {icon}
          {title}
        </h3>
        <Link
          href="/products"
          className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-primary transition-colors"
        >
          See all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
        {products.map((p) => (
          <div key={p.id} className="w-64 md:w-72 shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeProductsSection({ products }: HomeProductsSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const mostPopular = [...products]
    .sort((a, b) => (b.totalSales ?? 0) - (a.totalSales ?? 0))
    .slice(0, 5);

  const newArrivals = products.slice(0, 4);

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Most Popular horizontal row */}
      <HorizontalRow
        products={mostPopular}
        icon={<Flame className="w-5 h-5 text-orange-400" />}
        title="Most Popular"
        accentClass="text-orange-400"
      />

      {/* New Arrivals horizontal row */}
      <HorizontalRow
        products={newArrivals}
        icon={<Sparkles className="w-5 h-5 text-primary" />}
        title="New Arrivals"
        accentClass="text-primary"
      />

      {/* Browse by category divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest whitespace-nowrap">
          Browse by Category
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-nowrap overflow-x-auto pb-4 gap-3 justify-start md:justify-center no-scrollbar">
        {CATEGORIES.map((category) => (
          <CategoryPill
            key={category}
            category={category}
            isActive={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 mb-12">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
