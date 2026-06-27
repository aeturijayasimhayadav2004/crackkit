"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { RazorpayCheckout } from "@/components/RazorpayCheckout";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Zap, ArrowLeft, Smartphone, CreditCard, Building2, Lock } from "lucide-react";

type PaymentMethod = 'all' | 'upi' | 'card' | 'netbanking';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'upi', label: 'UPI / PhonePe / GPay', icon: <Smartphone className="w-4 h-4" />, color: '#5F259F' },
  { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard className="w-4 h-4" />, color: '#6C5CE7' },
  { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="w-4 h-4" />, color: '#00B4D8' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  const productIds = items.map((item) => item.id);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Summary */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-syne text-white mb-2">Order Summary</h1>

            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-background flex-shrink-0">
                      <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <span className="text-sm font-bold text-white line-clamp-1">{item.title}</span>
                      <span className="text-xs text-text-secondary">{item.category}</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex justify-between items-center text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-text-secondary">
                  <span>GST (18%)</span>
                  <span className="font-mono text-white">Inclusive</span>
                </div>
                <div className="flex justify-between items-end pt-4 mt-2 border-t border-border">
                  <span className="text-lg font-bold text-white">Amount to Pay</span>
                  <span className="text-3xl font-bold font-mono text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary text-right">GST inclusive pricing</p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
              <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary">
                <span className="text-primary font-bold block mb-1">Instant Digital Delivery</span>
                Your PDF files will be immediately available in your dashboard after successful payment.
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="w-full lg:w-1/2">
            <div className="bg-surface border border-border rounded-2xl p-6 lg:p-10 sticky top-24 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-8 text-center font-syne">
                Complete Your Purchase
              </h2>

              <div className="text-center mb-8">
                <span className="text-sm text-text-secondary block mb-2">Total Amount</span>
                <span className="text-5xl font-bold font-mono text-white tracking-tight">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-xs text-text-secondary text-center mb-3 uppercase tracking-widest font-semibold">
                  Choose Payment Method
                </p>
                <div className="flex flex-col gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-border bg-background text-text-secondary hover:border-primary/50 hover:text-white'
                        }`}
                      >
                        <span style={{ color: isSelected ? m.color : undefined }}>{m.icon}</span>
                        <span className="text-sm font-semibold">{m.label}</span>
                        {isSelected && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <RazorpayCheckout productIds={productIds} totalAmount={totalPrice} paymentMethod={selectedMethod} />

              <div className="flex items-center justify-center gap-2 mt-4 mb-6">
                <Lock className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-xs text-text-secondary font-medium">
                  256-bit SSL Secured by Razorpay
                </span>
              </div>

              <div className="text-center">
                <Link href="/refund" className="text-xs text-primary hover:underline">
                  Read our 7-day refund policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
