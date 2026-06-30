"use client";

import { useState } from 'react';
import { Download, ShoppingCart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore, type CartItem } from '@/store/cartStore';

interface DownloadButtonProps {
  productId: string;
  productTitle: string;
  isPurchased: boolean;
  fileId?: string;
  label?: string;
  product?: CartItem;
}

export function DownloadButton({
  productId,
  productTitle,
  isPurchased,
  fileId,
  label,
  product,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = fileId
        ? `/api/download/${productId}/file/${fileId}`
        : `/api/download/${productId}`;
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = `${productTitle}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objUrl);
        toast.success('Download started!');
      } else {
        const data = await response.json().catch(() => ({})) as { error?: string };
        if (response.status === 403) {
          toast.error(data.error ?? 'Purchase this product first');
        } else if (response.status === 429) {
          toast.error('Too many downloads. Try again in an hour.');
        } else if (response.status === 401) {
          toast.error('Please log in to download');
        } else {
          toast.error('Download failed. Please contact support.');
        }
      }
    } catch {
      toast.error('Download failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    toast.success('Added to cart!');
  };

  if (isPurchased) {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold transition-colors text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            {label ?? "Download PDF"}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white font-semibold transition-colors"
    >
      <ShoppingCart className="w-4 h-4" />
      Buy to Download
    </button>
  );
}
