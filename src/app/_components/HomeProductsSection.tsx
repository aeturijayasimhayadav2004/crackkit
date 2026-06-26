"use client";

import { useState } from "react";
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

export function HomeProductsSection({ products }: HomeProductsSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 mb-12">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
