import Link from "next/link";
import { Shield, Zap, CreditCard, MessageCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: About */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold font-syne text-white tracking-tight">
                <span className="text-primary">⚡</span> CrackKit
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              Premium digital study materials and PDF bundles to help you crack every interview and master every skill. Built for Indian students and developers.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-y border-border mb-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Zap className="w-4 h-4 text-primary" />
            <span>Instant Download</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Shield className="w-4 h-4 text-success" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CreditCard className="w-4 h-4 text-[#FFB020]" />
            <span>UPI Supported</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span>24/7 Support</span>
          </div>
        </div>

        {/* Razorpay trust badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xs text-text-secondary">Payments secured by</span>
          <span className="text-xs font-bold text-white bg-[#3395FF] px-2 py-0.5 rounded">
            Razorpay
          </span>
        </div>

        {/* Bottom */}
        <div className="text-center text-sm text-text-secondary">
          <p>© {currentYear} CrackKit. All rights reserved. Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
