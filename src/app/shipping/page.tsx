import { PageTransition } from "@/components/PageTransition";

export default function ShippingPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold font-syne text-white mb-8">Shipping & Delivery Policy</h1>
        <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-text-secondary">
          <p>Last updated: October 2024</p>
          <h2 className="text-white">Digital Delivery Only</h2>
          <p>CrackKit is a platform for digital study materials and PDF bundles. We do not sell or ship any physical products.</p>
          <h2 className="text-white">Instant Access</h2>
          <p>Upon successful payment confirmation via our payment gateway (Razorpay), your purchased PDF files will be instantly available for download. You can access them anytime by logging into your account and navigating to the &ldquo;My Downloads&rdquo; dashboard.</p>
          <h2 className="text-white">Access Issues</h2>
          <p>If you experience any issues accessing your downloads after a successful payment, please contact our support team immediately. Sometimes payment confirmations can be delayed by a few minutes depending on the banking network.</p>
        </div>
      </div>
    </PageTransition>
  );
}
