"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, {
      message: "You must accept the Terms of Service",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const GUEST_EMAIL = "guest@crackkit.dev";
const GUEST_PASSWORD = "GuestCrackKit@2025";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("email", { message: error.message });
      toast.error(error.message);
      return;
    }

    setSuccessEmail(data.email);
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: GUEST_EMAIL,
      password: GUEST_PASSWORD,
    });

    if (error) {
      toast.error("Guest login unavailable. Try again.");
      setIsGuestLoading(false);
      return;
    }

    toast.success("👀 Browsing as Guest");
    router.push("/products");
    router.refresh();
  };

  // Success screen
  if (successEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-syne text-white mb-2">Check your inbox!</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              We sent a verification link to{" "}
              <span className="text-white font-medium">{successEmail}</span>.
              Click it to activate your account.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(108,92,231,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-10">
          <div className="text-center">
            <p className="text-4xl font-bold font-syne text-white tracking-tight mb-3">
              <span className="text-primary">⚡</span> CrackKit
            </p>
            <p className="text-text-secondary text-base leading-relaxed">
              Crack Every Interview.
              <br />
              Master Every Skill.
            </p>
          </div>

          <div className="w-full flex flex-col gap-4">
            {[
              { title: "DSA Mastery Bundle", price: "₹299", tag: "450 pages" },
              { title: "System Design Bible", price: "₹349", tag: "290 pages" },
              { title: "Top 500 Questions", price: "₹199", tag: "520 pages" },
            ].map((card, i) => (
              <div
                key={i}
                className="relative rounded-xl p-4 flex items-center justify-between"
                style={{
                  background: "rgba(10,10,15,0.7)",
                  border: "1px solid rgba(108,92,231,0.3)",
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(108,92,231,0.15), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2.5s linear infinite",
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
                <div className="flex flex-col gap-1">
                  <div className="w-32 h-2 rounded bg-border opacity-60" />
                  <p className="text-white text-sm font-medium font-syne mt-1">{card.title}</p>
                  <span className="text-text-secondary text-xs">{card.tag}</span>
                </div>
                <span className="text-primary font-bold font-mono text-sm bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                  {card.price}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                style={{
                  opacity: 0.3 + i * 0.1,
                  animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-bold font-syne text-white">
              <span className="text-primary">⚡</span> CrackKit
            </Link>
          </div>

          <h1 className="text-3xl font-bold font-syne text-white mb-2">Create your account</h1>
          <p className="text-text-secondary mb-8 text-sm">
            Join 6,000+ students learning smarter
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Aarav Sharma"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-badge text-xs">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-badge text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-surface border border-border text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-badge text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-surface border border-border text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-badge text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded accent-primary shrink-0"
                  {...register("terms")}
                />
                <span className="text-sm text-text-secondary leading-snug">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-primary hover:text-primary-hover transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-primary hover:text-primary-hover transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-badge text-xs">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-secondary text-xs">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Guest */}
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
              className="w-full py-3 rounded-xl border border-border hover:border-text-secondary text-text-secondary hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGuestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </>
              ) : (
                "Continue as Guest"
              )}
            </button>

            {/* Google — coming soon */}
            {/* <button type="button" className="...">Continue with Google</button> */}
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
