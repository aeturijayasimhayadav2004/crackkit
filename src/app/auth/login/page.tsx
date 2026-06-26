"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const GUEST_EMAIL = "guest@crackkit.dev";
const GUEST_PASSWORD = "GuestCrackKit@2025";

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard/downloads";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("email", { message: "Invalid email or password" });
      setError("password", { message: "Invalid email or password" });
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Welcome back! 👋");
    router.push(redirect);
    router.refresh();
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

  return (
    <div className="min-h-screen flex">
      {/* Left panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Radial violet glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(108,92,231,0.18) 0%, transparent 70%)",
          }}
        />
        {/* Animated glow orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-10">
          {/* Logo */}
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

          {/* Floating product card mockups */}
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
                  boxShadow: "0 0 20px rgba(108,92,231,0.08)",
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Shimmer border effect */}
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
                  <p className="text-white text-sm font-medium font-syne mt-1">
                    {card.title}
                  </p>
                  <span className="text-text-secondary text-xs">{card.tag}</span>
                </div>
                <span className="text-primary font-bold font-mono text-sm bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                  {card.price}
                </span>
              </div>
            ))}
          </div>

          {/* Particle dots */}
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

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-bold font-syne text-white">
              <span className="text-primary">⚡</span> CrackKit
            </Link>
          </div>

          <h1 className="text-3xl font-bold font-syne text-white mb-2" suppressHydrationWarning>
            Welcome back 👋
          </h1>
          <p className="text-text-secondary mb-8 text-sm">
            Sign in to access your downloads
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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
                  autoComplete="current-password"
                  placeholder="••••••••"
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

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-primary"
                  {...register("rememberMe")}
                />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:text-primary-hover transition-colors"
              >
                Forgot Password?
              </Link>
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
                  Signing in…
                </>
              ) : (
                "Log in"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-secondary text-xs">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Guest login */}
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
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Sign up
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
