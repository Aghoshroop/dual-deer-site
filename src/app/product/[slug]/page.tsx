"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProducts } from "@/lib/store";
import { DEFAULT_PRODUCTS, getRelatedProducts } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";
import type { Product } from "@/lib/products";

export default function ProductPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!slug) return;

    // Try dynamic store first (includes admin-added products)
    const storeProducts = getProducts();
    let found = storeProducts.find((p) => p.slug === slug);

    // Fall back to default products if not in store
    if (!found) {
      found = DEFAULT_PRODUCTS.find((p) => p.slug === slug);
    }

    if (found) {
      setProduct(found);
      // Get related from same source
      setRelatedProducts(getRelatedProducts(found));
    } else {
      setProduct(null);
    }
  }, [slug]);

  // Still loading
  if (product === undefined) {
    return (
      <main className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-gray-600 text-sm font-mono">Loading product...</p>
        </div>
      </main>
    );
  }

  // Not found
  if (!product) {
    return (
      <main className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-4xl font-black text-white">Product Not Found</p>
          <p className="text-gray-500">This product may have been removed.</p>
          <a href="/shop" className="inline-block mt-4 px-6 py-3 rounded-xl text-white font-bold"
            style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)" }}>
            Back to Shop
          </a>
        </div>
      </main>
    );
  }

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
