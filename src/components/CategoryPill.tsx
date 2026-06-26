import { cn } from "@/lib/utils";

interface CategoryPillProps {
  category: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryPill({ category, isActive = false, onClick, className }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
        isActive
          ? "bg-primary text-white border border-primary shadow-[0_0_10px_rgba(108,92,231,0.3)]"
          : "bg-transparent text-text-secondary border border-border hover:border-primary/50 hover:text-white",
        className
      )}
    >
      {category}
    </button>
  );
}
