import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export function EmptyState({ title, subtitle, ctaText, ctaHref, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-border">
        <FolderOpen className="w-10 h-10 text-text-secondary" />
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
