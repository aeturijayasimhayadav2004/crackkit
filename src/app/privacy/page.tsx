import { PageTransition } from "@/components/PageTransition";

export default function PrivacyPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold font-syne text-white mb-8">Privacy Policy</h1>
        <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-text-secondary">
          <p>Last updated: October 2024</p>
          <h2 className="text-white">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
          <h2 className="text-white">2. How We Use Your Information</h2>
          <p>We use the information we collect about you to provide, maintain, and improve our services, such as to facilitate payments, send receipts, provide products and services you request, and develop new features.</p>
          <h2 className="text-white">3. Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        </div>
      </div>
    </PageTransition>
  );
}
