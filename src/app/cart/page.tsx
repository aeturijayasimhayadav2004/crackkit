"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { EmptyState } from "@/components/EmptyState";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Trash2, ArrowRight, Shield, Zap, RefreshCcw } from "lucide-react";
import { CheckoutProgress } from "@/components/CheckoutProgress";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice());
  
  // Calculate discount logic - since mock doesn't store original price in cart item directly, 
  // we'll just mock a generic discount or calculate it if we updated CartItem interface.
  // For now, let's say total discount is 10% on cart total, or just sum original prices if we had them.
  // We'll leave discount as a UI element showing fixed value if needed, or 0.
  
  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-20 min-h-[60vh] flex items-center justify-center">
          <EmptyState
            title="Your cart is empty"
            subtitle="Looks like you haven't added any study materials yet. Explore our premium bundles."
            ctaText="Browse Products"
            ctaHref="/products"
            variant="cart"
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 min-h-[70vh]">
        <CheckoutProgress step={1} />
        <h1 className="text-4xl font-bold font-syne text-white mb-8">Your Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="w-full lg:w-[65%] flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-surface border border-border p-4 rounded-2xl items-center relative pr-12">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0">
                  <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">{item.category}</span>
                  <Link href={`/products/${item.id}`} className="text-lg font-bold text-white hover:text-primary transition-colors line-clamp-1 mb-1">
                    {item.title}
                  </Link>
                  <div className="text-lg font-mono font-bold text-white mt-auto">
                    {formatPrice(item.price)}
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-text-secondary hover:text-badge hover:bg-badge/10 rounded-full transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[35%]">
            <div className="bg-surface border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 font-syne">Order Summary</h2>
              
              <div className="flex justify-between items-center mb-4 text-text-secondary">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-mono text-white">{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-6 text-text-secondary">
                <span>GST (18% inclusive)</span>
                <span className="font-mono text-white">{formatPrice(0)}</span>
              </div>
              
              <div className="border-t border-border pt-4 mb-8 flex justify-between items-end">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">{formatPrice(totalPrice)}</span>
              </div>
              
              <button 
                onClick={() => router.push('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-colors mb-4"
              >
                Proceed to Pay <ArrowRight className="w-5 h-5" />
              </button>
              
              <p className="text-center text-xs text-text-secondary mb-6 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Secured by Razorpay
              </p>
              
              <div className="grid grid-cols-3 gap-2 border-t border-border pt-6">
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="w-5 h-5 text-text-secondary" />
                  <span className="text-[10px] text-text-secondary uppercase">256-bit SSL</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-success" />
                  <span className="text-[10px] text-text-secondary uppercase">Instant Access</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-primary" />
                  <span className="text-[10px] text-text-secondary uppercase">Easy Refund</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
