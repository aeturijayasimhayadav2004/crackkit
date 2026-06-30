import { PageTransition } from "@/components/PageTransition";
import { getProducts } from "@/lib/supabase/queries";
import { ProductsClient } from "./ProductsClient";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold font-syne text-white mb-6 md:mb-8">
          All Products
        </h1>
        <ProductsClient initialProducts={products} />
      </div>
    </PageTransition>
  );
}
