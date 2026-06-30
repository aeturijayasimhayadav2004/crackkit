import { ShoppingCart, CreditCard, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  step: 1 | 2 | 3;
}

const STEPS = [
  { label: "Cart", Icon: ShoppingCart },
  { label: "Payment", Icon: CreditCard },
  { label: "Download", Icon: Download },
] as const;

export function CheckoutProgress({ step }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((s, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  done && "bg-primary border-primary",
                  active && "border-primary bg-primary/10 shadow-[0_0_14px_rgba(108,92,231,0.35)]",
                  !done && !active && "border-border bg-background"
                )}
              >
                {done ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <s.Icon
                    className={cn(
                      "w-4 h-4",
                      active ? "text-primary" : "text-text-secondary"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold whitespace-nowrap",
                  done || active ? "text-primary" : "text-text-secondary"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-16 md:w-24 h-0.5 mx-2 mb-5 transition-all duration-300",
                  num < step ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
