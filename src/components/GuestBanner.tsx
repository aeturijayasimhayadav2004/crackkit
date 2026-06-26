"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function GuestBanner() {
  const { isGuest } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isGuest || dismissed) return null;

  return (
    <div
      className="w-full flex items-center justify-between px-4 py-2 gap-4 text-sm z-40"
      style={{ backgroundColor: "#FFB020", color: "#0A0A0F" }}
    >
      <p className="font-medium text-center flex-1">
        👀 You&apos;re browsing as Guest —{" "}
        <Link
          href="/auth/signup"
          className="underline font-semibold hover:opacity-80 transition-opacity"
        >
          Sign up free to download your purchases
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
