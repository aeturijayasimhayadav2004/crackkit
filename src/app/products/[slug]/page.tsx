import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/supabase/queries";
import { ProductDetailClient } from "./ProductDetailClient";

const BASE_URL = "https://crackkit.vercel.app";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const description =
    product.description?.slice(0, 160) ??
    `${product.title} — ${product.pages} pages of premium ${product.category} study material. Instant PDF download for ₹${product.price}.`;
  const url = `${BASE_URL}/products/${product.slug}`;

  return {
    title: product.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description,
      url,
      type: "website",
      images: [{ url: product.coverImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: [product.coverImage],
    },
  };
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

  const imageUrl = product.coverImage.startsWith("http")
    ? product.coverImage
    : `${BASE_URL}${product.coverImage}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.description ??
      `${product.title} — premium ${product.category} study material.`,
    image: imageUrl,
    category: product.category,
    brand: { "@type": "Brand", name: "CrackKit" },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={paddedRelated} />
    </>
  );
}
