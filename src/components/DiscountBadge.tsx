import { cn } from "@/lib/utils";

interface DiscountBadgeProps {
  discount: number;
  className?: string;
}

export function DiscountBadge({ discount, className }: DiscountBadgeProps) {
  if (discount <= 0) return null;

  return (
    <div
      className={cn(
        "px-2 py-1 bg-badge text-white text-xs font-bold rounded-md shadow-lg font-mono",
        className
      )}
    >
      -{discount}% OFF
    </div>
  );
}
