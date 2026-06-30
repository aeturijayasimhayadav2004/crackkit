import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmptyVariant = "default" | "cart" | "wishlist" | "downloads";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
  variant?: EmptyVariant;
}

function CartIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48" cy="48" r="44" fill="#6C5CE7" fillOpacity="0.07" />
      <circle cx="48" cy="48" r="44" stroke="#6C5CE7" strokeOpacity="0.15" strokeWidth="1" />
      <path d="M22 30h8l6 32h28l6-22H36" stroke="#6C5CE7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="67" r="3.5" stroke="#6C5CE7" strokeWidth="2.5" />
      <circle cx="58" cy="67" r="3.5" stroke="#6C5CE7" strokeWidth="2.5" />
      <path d="M66 26l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2L66 26z" fill="#6C5CE7" fillOpacity="0.55" />
      <path d="M27 40l0.7 1.8 1.8 0.7-1.8 0.7-0.7 1.8-0.7-1.8-1.8-0.7 1.8-0.7L27 40z" fill="#6C5CE7" fillOpacity="0.35" />
      <path d="M72 50l0.5 1.3 1.3 0.5-1.3 0.5-0.5 1.3-0.5-1.3-1.3-0.5 1.3-0.5L72 50z" fill="#6C5CE7" fillOpacity="0.25" />
    </svg>
  );
}

function WishlistIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48" cy="48" r="44" fill="#FF4757" fillOpacity="0.07" />
      <circle cx="48" cy="48" r="44" stroke="#FF4757" strokeOpacity="0.15" strokeWidth="1" />
      <path
        d="M48 70 C43 63 24 53 24 39a15 15 0 0 1 24-12 15 15 0 0 1 24 12c0 14-19 24-24 31z"
        fill="none"
        stroke="#FF4757"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M67 27l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2L67 27z" fill="#FF4757" fillOpacity="0.55" />
      <path d="M28 31l0.7 1.8 1.8 0.7-1.8 0.7-0.7 1.8-0.7-1.8-1.8-0.7 1.8-0.7L28 31z" fill="#FF4757" fillOpacity="0.4" />
      <path d="M71 58l0.5 1.3 1.3 0.5-1.3 0.5-0.5 1.3-0.5-1.3-1.3-0.5 1.3-0.5L71 58z" fill="#FF4757" fillOpacity="0.3" />
    </svg>
  );
}

function DownloadsIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48" cy="48" r="44" fill="#00D68F" fillOpacity="0.07" />
      <circle cx="48" cy="48" r="44" stroke="#00D68F" strokeOpacity="0.15" strokeWidth="1" />
      <path d="M48 28v30" stroke="#00D68F" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 46l12 12 12-12" stroke="#00D68F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 64h40" stroke="#00D68F" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M70 30l0.8 2 2 0.8-2 0.8-0.8 2-0.8-2-2-0.8 2-0.8L70 30z" fill="#00D68F" fillOpacity="0.5" />
      <path d="M27 44l0.6 1.5 1.5 0.6-1.5 0.6-0.6 1.5-0.6-1.5-1.5-0.6 1.5-0.6L27 44z" fill="#00D68F" fillOpacity="0.35" />
    </svg>
  );
}

function DefaultIllustration() {
  return (
    <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center border border-border">
      <FolderOpen className="w-10 h-10 text-text-secondary" />
    </div>
  );
}

function Illustration({ variant }: { variant: EmptyVariant }) {
  if (variant === "cart") return <CartIllustration />;
  if (variant === "wishlist") return <WishlistIllustration />;
  if (variant === "downloads") return <DownloadsIllustration />;
  return <DefaultIllustration />;
}

export function EmptyState({
  title,
  subtitle,
  ctaText,
  ctaHref,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-6 animate-float">
        <Illustration variant={variant} />
      </div>
      <h3 className="text-2xl font-syne font-bold text-white mb-2">{title}</h3>
      <p className="text-text-secondary mb-8 max-w-md mx-auto">{subtitle}</p>

      {ctaText && ctaHref && (
        <Link
          href={ctaHref}
          className="bg-primary hover:bg-primary-hover text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          {ctaText}
        </Link>
      )}
    </div>
  );
}
