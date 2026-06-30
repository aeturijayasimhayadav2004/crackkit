// First-purchase welcome coupon. Single source of truth shared by the
// client (checkout display) and server (order creation + validation).
// The server is always authoritative for the charged amount.

export const WELCOME_COUPON = 'WELCOME10';
export const WELCOME_DISCOUNT_PCT = 10;

export function normalizeCoupon(code: string | null | undefined): string {
  return (code ?? '').trim().toUpperCase();
}

export function isWelcomeCoupon(code: string | null | undefined): boolean {
  return normalizeCoupon(code) === WELCOME_COUPON;
}

// Apply the welcome discount to a paise subtotal, rounding to whole rupees so
// the UI and the Razorpay charge always agree.
export function applyWelcomeDiscountPaise(subtotalPaise: number): number {
  const discounted = (subtotalPaise * (100 - WELCOME_DISCOUNT_PCT)) / 100;
  return Math.round(discounted / 100) * 100;
}

// Convenience for the rupee-denominated UI.
export function applyWelcomeDiscountRupees(subtotalRupees: number): number {
  return applyWelcomeDiscountPaise(subtotalRupees * 100) / 100;
}
