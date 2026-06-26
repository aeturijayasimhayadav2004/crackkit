import { PageTransition } from "@/components/PageTransition";

export default function TermsPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold font-syne text-white mb-8">Terms of Service</h1>
        <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-text-secondary">
          <p>Last updated: October 2024</p>
          <h2 className="text-white">1. Acceptance of Terms</h2>
          <p>By accessing or using CrackKit&apos;s services, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Services.</p>
          <h2 className="text-white">2. Intellectual Property Rights</h2>
          <p>All digital products, PDFs, content, and materials available on CrackKit are the intellectual property of CrackKit. You are granted a limited, non-exclusive, non-transferable license to download and use the materials for personal, non-commercial educational purposes only. You may not distribute, modify, or resell our materials.</p>
          <h2 className="text-white">3. User Accounts</h2>
          <p>You may need to register for an account to access some features of our service. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
        </div>
      </div>
    </PageTransition>
  );
}
