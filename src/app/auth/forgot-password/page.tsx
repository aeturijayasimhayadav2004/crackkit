"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof schema>;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ForgotForm) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${APP_URL}/auth/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-2xl p-8">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-5">
              <CheckCircle className="w-12 h-12 text-success" />
              <div>
                <h2 className="text-xl font-bold font-syne text-white mb-2">Reset link sent!</h2>
                <p className="text-text-secondary text-sm">
                  Check your email at{" "}
                  <span className="text-white font-medium">{getValues("email")}</span>
                  {" "}for the reset link.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-text-secondary hover:text-white text-sm transition-colors mb-6 inline-block">
                ← Back to Login
              </Link>
              <h1 className="text-2xl font-bold font-syne text-white mb-2">Forgot Password?</h1>
              <p className="text-text-secondary text-sm mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-badge text-xs">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
