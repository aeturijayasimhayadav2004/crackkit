import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/data/mockProducts';

// Minimal slice of a Product we need to render a saved item.
export interface WishlistItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  coverImage: string;
  category: string;
}

interface WishlistStore {
  items: WishlistItem[];
  toggle: (product: Product) => boolean; // returns true if now saved, false if removed
  add: (product: Product) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  count: () => number;
}

function toItem(p: Product): WishlistItem {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice,
    coverImage: p.coverImage,
    category: p.category,
  };
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((i) => i.id === product.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((i) => i.id !== product.id) }));
          return false;
        }
        set((state) => ({ items: [...state.items, toItem(product)] }));
        return true;
      },
      add: (product) =>
        set((state) =>
          state.items.some((i) => i.id === product.id)
            ? state
            : { items: [...state.items, toItem(product)] }
        ),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    {
      name: 'crackkit-wishlist',
    }
  )
);
