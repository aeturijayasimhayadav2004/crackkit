import { PageTransition } from "@/components/PageTransition";

export default function RefundPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold font-syne text-white mb-8">Refund Policy</h1>
        <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-text-secondary">
          <p>Last updated: October 2024</p>
          <h2 className="text-white">7-Day Money-Back Guarantee</h2>
          <p>We offer a 7-day refund policy for all our digital products, subject to the following condition:</p>
          <ul>
            <li><strong>You have not downloaded the file.</strong> Because our products are digital PDFs, once a file is downloaded, it cannot be &ldquo;returned.&rdquo; Therefore, refunds are only issued if our system shows that you have not downloaded the purchased materials.</li>
          </ul>
          <h2 className="text-white">How to Request a Refund</h2>
          <p>If you meet the criteria above and wish to request a refund, please contact our support team with your order number within 7 days of your purchase. Refunds will be processed back to the original payment method within 5-7 business days.</p>
        </div>
      </div>
    </PageTransition>
  );
}
