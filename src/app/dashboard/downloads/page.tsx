"use client";

import Image from "next/image";
import { PageTransition } from "@/components/PageTransition";
import { mockProducts } from "@/data/mockProducts";
import { Download, Lock, Calendar, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function DownloadsPage() {
  // Mock logged in state - First 2 products are purchased
  const purchasedProducts = mockProducts.slice(0, 2);
  const remainingProducts = mockProducts.slice(2);

  const handleDownload = () => {
    toast("Download will be available after connecting backend", {
      icon: '⬇️',
    });
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[70vh]">
        <h1 className="text-4xl font-bold font-syne text-white mb-12">My Downloads</h1>
        
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-border pb-4">Your Purchases</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purchasedProducts.map((product) => (
              <div key={product.id} className="bg-surface border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-background flex-shrink-0 shadow-lg">
                  <Image src={product.coverImage} alt={product.title} fill className="object-cover" />
                </div>
                
                <div className="flex flex-col flex-grow w-full">
                  <span className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{product.category}</span>
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{product.title}</h3>
                  
                  <div className="flex items-center gap-4 text-xs text-text-secondary mb-6">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Oct 24, 2024</span>
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {product.pages} Pages</span>
                  </div>
                  
                  <button 
                    onClick={handleDownload}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-border pb-4">Explore More</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {remainingProducts.map((product) => (
              <div key={product.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col h-full">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-background mb-4">
                  <Image src={product.coverImage} alt={product.title} fill className="object-cover opacity-50 grayscale" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full">
                      <Lock className="w-6 h-6 text-text-secondary" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 flex-grow">{product.title}</h3>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="font-mono font-bold text-white">{formatPrice(product.price)}</span>
                  <Link 
                    href={`/products/${product.slug}`}
                    className="text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
