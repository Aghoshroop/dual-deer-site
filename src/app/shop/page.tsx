import type { Metadata } from "next";
import { Suspense } from "react";
import ShopGrid from "@/components/ShopGrid";
import JsonLd from "@/components/JsonLd";
import { DEFAULT_PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop Best Activewear Online | Elite Compression Suits & Speed Suits — DualDeer",
  description:
    "Shop DualDeer's full collection — the best activewear online. Elite carbon-fiber compression suits, speed suits, training tights & recovery gear. Engineered for champions. Free shipping over $200.",
  keywords: [
    "buy activewear online", "shop performance compression suit", "best activewear shop",
    "elite compression suits for sale", "speed suit shop", "buy performance sportswear",
    "DualDeer shop", "best athletic compression wear", "top selling compression suits",
    "performance sportswear collection", "buy carbon fiber compression suit",
    "activewear sale", "performance tights", "best compression tights",
  ],
  openGraph: {
    title: "Shop Best Activewear Online — DualDeer Elite Performance Collection",
    description:
      "The best activewear collection online. Carbon-fiber compression suits, speed suits & training tights engineered for world-class athletes.",
    url: "https://www.dualdeer.com/shop",
    siteName: "DualDeer Performance Lab",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DualDeer Shop — Best Activewear Online" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop DualDeer — Best Activewear & Compression Suits Online",
    description: "Elite carbon-fiber compression suits and speed suits for world-class athletes.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://www.dualdeer.com/shop",
  },
};

export default function ShopPage() {
  const allProducts = DEFAULT_PRODUCTS.map((p) => ({
    name: p.name,
    slug: p.slug,
    price: p.price,
    description: p.description,
  }));

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* SportsStore + ItemList schemas for rich product carousel results */}
      <JsonLd type="sportsstore" />
      <JsonLd type="itemlist" products={allProducts} />
      <JsonLd
        type="breadcrumb"
        items={[
          { name: "Home", url: "https://www.dualdeer.com" },
          { name: "Shop", url: "https://www.dualdeer.com/shop" },
        ]}
      />
      <Suspense fallback={<div className="py-32 text-center text-gray-600">Loading products...</div>}>
        <ShopGrid />
      </Suspense>
    </main>
  );
}
