"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are processed by Razorpay, India's most trusted payment gateway. We never store your card details.",
  },
  {
    q: "Do I get instant access after paying?",
    a: "Yes! Download links appear immediately after payment confirmation in your My Downloads page.",
  },
  {
    q: "What format are the files?",
    a: "All files are in PDF format, compatible with any device — phone, tablet, or laptop.",
  },
  {
    q: "Can I use UPI to pay?",
    a: "Yes! We support all UPI apps — GPay, PhonePe, Paytm, BHIM, and more.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 7-day refund if you haven't downloaded the file. See our Refund Policy for details.",
  },
];

export function HomeFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-surface border border-border rounded-xl overflow-hidden transition-all"
        >
          <button
            className="w-full flex items-center justify-between p-5 text-left font-semibold text-white focus:outline-none"
            onClick={() => setOpenFaq(openFaq === index ? null : index)}
          >
            {faq.q}
            {openFaq === index ? (
              <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
            )}
          </button>

          <div
            className={cn(
              "px-5 overflow-hidden transition-all duration-300 ease-in-out",
              openFaq === index
                ? "max-h-40 pb-5 opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <p className="text-text-secondary text-sm leading-relaxed">
              {faq.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
