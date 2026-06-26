import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/supabase/queries";
import { ProductDetailClient } from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const paddedRelated =
    relatedProducts.length < 3
      ? [
          ...relatedProducts,
          ...allProducts
            .filter(
              (p) =>
                p.id !== product.id &&
                !relatedProducts.find((rp) => rp.id === p.id)
            )
            .slice(0, 3 - relatedProducts.length),
        ]
      : relatedProducts;

  return (
    <ProductDetailClient product={product} relatedProducts={paddedRelated} />
  );
}
