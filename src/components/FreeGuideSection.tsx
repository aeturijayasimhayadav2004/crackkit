"use client";

import { useState } from "react";
import { Gift, Download, Loader2, CheckCircle2, FileText } from "lucide-react";
import toast from "react-hot-toast";

export function FreeGuideSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [guideUrl, setGuideUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "home-free-guide" }),
      });
      const data = await res.json();
      if (res.ok) {
        setGuideUrl(data.guideUrl);
        toast.success("Your free guide is ready!");
      } else {
        toast.error(data.error || "Something went wrong. Try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="free-preview" className="py-12 md:py-20 bg-surface border-y border-border scroll-mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 rounded-3xl p-6 md:p-12 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Left: copy */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5" /> Free Download
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-syne text-white mb-3 leading-tight">
                Top 50 DSA Interview Questions
              </h2>
              <p className="text-text-secondary mb-6">
                A free, no-strings PDF of the 50 most-asked data structures &amp;
                algorithms questions — with crisp model answers. Drop your email
                and grab it instantly.
              </p>

              {guideUrl ? (
                <div className="flex flex-col items-center md:items-start gap-3">
                  <div className="flex items-center gap-2 text-success font-semibold">
                    <CheckCircle2 className="w-5 h-5" /> You&apos;re in! Enjoy the guide.
                  </div>
                  <a
                    href={guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Free Guide
                  </a>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-grow bg-background border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-secondary focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      "Get Free PDF"
                    )}
                  </button>
                </form>
              )}
              <p className="text-xs text-text-secondary mt-3">
                No spam. Just the guide and the occasional new-drop alert.
              </p>
            </div>

            {/* Right: visual */}
            <div className="flex-shrink-0">
              <div className="w-40 h-52 bg-background border border-border rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-3 rotate-3 hover:rotate-0 transition-transform">
                <FileText className="w-16 h-16 text-primary" />
                <span className="text-xs text-text-secondary font-mono">DSA-Top50.pdf</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
