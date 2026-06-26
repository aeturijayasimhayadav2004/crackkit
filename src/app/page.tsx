import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { HomeProductsSection } from "./_components/HomeProductsSection";
import { HomeFaqSection } from "./_components/HomeFaqSection";
import { getProducts } from "@/lib/supabase/queries";
import { ShoppingCart, CreditCard, Zap, Star } from "lucide-react";

export default async function Home() {
  const products = await getProducts();

  return (
    <PageTransition>
      {/* Section 1: Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.15),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold font-syne text-white mb-6 leading-tight">
            Crack Every Interview. <br className="hidden md:block" />
            Master Every Skill.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Premium study bundles for DSA, Web Dev, System Design & more.
            Instant download. Indian prices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/products"
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="#free-preview"
              className="w-full sm:w-auto border border-border hover:border-text-secondary text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              View Free Preview
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-border bg-surface border border-border rounded-xl p-6">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-2xl font-bold text-white font-mono">
                6,000+
              </span>
              <span className="text-sm text-text-secondary">Students</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-2xl font-bold text-white font-mono">
                50+
              </span>
              <span className="text-sm text-text-secondary">Premium PDFs</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-2xl font-bold text-white font-mono">
                ₹249
              </span>
              <span className="text-sm text-text-secondary">Avg Price</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-2xl font-bold text-success font-mono">
                4.9/5
              </span>
              <span className="text-sm text-text-secondary flex items-center gap-1">
                <Star className="w-4 h-4 fill-success text-success" /> Rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 & 3: Products */}
      <section className="py-20 bg-background" id="products">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-syne text-white mb-8">
              What do you want to master?
            </h2>
            <HomeProductsSection products={products} />
          </div>

          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center text-primary font-medium hover:text-primary-hover transition-colors"
            >
              View All Products &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section className="py-20 bg-surface border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-syne text-white mb-16">
            Get your material in 3 steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-[2px] border-t-2 border-dashed border-border -translate-y-1/2 z-0" />

            <div className="relative z-10 flex flex-col items-center bg-surface">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                Step 1
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Browse & Pick
              </h3>
              <p className="text-text-secondary">
                Find the perfect bundle for your interview prep needs.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-surface">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                Step 2
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Pay via UPI/Card
              </h3>
              <p className="text-text-secondary">
                Secure checkout via Razorpay with all payment methods.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-surface">
              <div className="w-16 h-16 rounded-2xl bg-[#00D68F]/10 border border-[#00D68F]/20 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-success" />
              </div>
              <span className="text-xs font-bold text-success bg-[#00D68F]/10 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                Step 3
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Instant Download
              </h3>
              <p className="text-text-secondary">
                Get immediate access to your high-quality PDFs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-syne text-white text-center mb-12">
            Loved by 6,000+ students across India
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-white italic mb-6">
                &ldquo;Cracked my Amazon interview using the DSA bundle. Worth
                every rupee! The explanations are so much better than random
                blogs.&rdquo;
              </p>
              <div>
                <p className="font-bold text-white">Ravi Kumar</p>
                <p className="text-sm text-text-secondary">IIT Delhi</p>
              </div>
            </div>

            <div className="bg-surface border border-border p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-white italic mb-6">
                &ldquo;The MERN kit saved me weeks of research. Best ₹299 I&apos;ve
                spent. I built my entire final year project using these
                concepts.&rdquo;
              </p>
              <div>
                <p className="font-bold text-white">Priya Sharma</p>
                <p className="text-sm text-text-secondary">Bangalore</p>
              </div>
            </div>

            <div className="bg-surface border border-border p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-white italic mb-6">
                &ldquo;System design notes are incredibly detailed. Highly
                recommend. It covers HLD and LLD in a way that actually makes
                sense.&rdquo;
              </p>
              <div>
                <p className="font-bold text-white">Arjun Mehta</p>
                <p className="text-sm text-text-secondary">Pune</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: FAQ */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold font-syne text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <HomeFaqSection />
        </div>
      </section>
    </PageTransition>
  );
}
