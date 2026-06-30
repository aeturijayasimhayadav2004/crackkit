"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { type Product } from "@/data/mockProducts";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = [
  "All",
  "DSA & Algorithms",
  "Web Development",
  "System Design",
  "Database & SQL",
  "Interview Prep",
  "Python & ML",
];

interface ProductsClientProps {
  initialProducts: Product[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  let filtered = initialProducts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === "price_low") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === "discount") {
    filtered = [...filtered].sort((a, b) => {
      const dA = (a.originalPrice - a.price) / a.originalPrice;
      const dB = (b.originalPrice - b.price) / b.originalPrice;
      return dB - dA;
    });
  }

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== "All" ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile filter toggle — hidden on desktop */}
      <div className="flex lg:hidden items-center gap-3 mb-2">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-text-secondary hover:text-white transition-colors text-sm font-semibold"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        {showFilters && (
          <button
            onClick={() => setShowFilters(false)}
            className="p-2 text-text-secondary hover:text-white transition-colors"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sidebar */}
      <div className={`w-full lg:w-1/4 flex-col gap-6 ${showFilters ? "flex" : "hidden"} lg:flex`}>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
          </h2>

          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 block">
                Categories
              </label>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center w-4 h-4 rounded border border-border bg-background group-hover:border-primary transition-colors">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="opacity-0 absolute inset-0 cursor-pointer"
                      />
                      {selectedCategory === cat && (
                        <div className="w-2 h-2 rounded-sm bg-primary" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${selectedCategory === cat ? "text-white" : "text-text-secondary group-hover:text-white transition-colors"}`}
                    >
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                Sort By
              </label>
              <select
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_low">Price: Low to High</option>
                <option value="popular">Most Popular</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-bold text-white">{filtered.length}</span>{" "}
            products
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <p className="text-lg text-white mb-2">No products found</p>
            <p className="text-text-secondary">
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-6 text-primary hover:text-primary-hover underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
