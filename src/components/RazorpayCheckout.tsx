"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Lock, Loader2 } from 'lucide-react';

interface RazorpayCheckoutProps {
  productIds: string[];
  totalAmount: number;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

export function RazorpayCheckout({ productIds, totalAmount }: RazorpayCheckoutProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    setLoading(true);
    const toastId = toast.loading('Confirming your payment...');
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
      toast.dismiss(toastId);
      if (res.ok) {
        router.push('/checkout/success');
      } else {
        router.push('/checkout/failed');
      }
    } catch {
      toast.dismiss(toastId);
      router.push('/checkout/failed');
    }
  };

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast.error('Payment system loading, please try again');
      return;
    }
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      const { razorpayOrderId, amount } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'CrackKit',
        description: 'Premium Study Materials',
        image: '/logo.png',
        order_id: razorpayOrderId,
        prefill: {
          name: profile?.full_name ?? '',
          email: user.email ?? '',
        },
        theme: { color: '#6C5CE7' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setLoading(false);
          },
        },
        handler: (response: RazorpayResponse) => {
          void handlePaymentSuccess(response);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch {
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-primary font-semibold">
        Pay via UPI — fastest for Indian users
      </p>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(108,92,231,0.3)] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ₹{totalAmount.toLocaleString('en-IN')} with Razorpay
          </>
        )}
      </button>
    </div>
  );
}
