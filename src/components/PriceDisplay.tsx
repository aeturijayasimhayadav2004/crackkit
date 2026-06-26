import { formatPrice, calculateDiscount } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  originalPrice: number;
  currentPrice: number;
  className?: string;
}

export function PriceDisplay({ originalPrice, currentPrice, className }: PriceDisplayProps) {
  const discount = calculateDiscount(originalPrice, currentPrice);

  return (
    <div className={cn("flex items-end gap-2 font-mono", className)}>
      <span className="text-2xl font-bold text-white leading-none">
        {formatPrice(currentPrice)}
      </span>
      {originalPrice > currentPrice && (
        <>
          <span className="text-sm text-text-secondary line-through mb-0.5">
            {formatPrice(originalPrice)}
          </span>
          <span className="text-sm font-semibold text-success mb-0.5 ml-1">
            {discount}% OFF
          </span>
        </>
      )}
    </div>
  );
}
