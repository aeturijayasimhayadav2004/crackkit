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

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
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

            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-3 rounded-xl border border-border hover:border-text-secondary bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

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
