import type { Metadata } from "next";
import { Suspense } from "react";
import ShopGrid from "@/components/ShopGrid";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Shop Elite Performance Activewear | DualDeer",
  description:
    "Shop DualDeer's full collection of elite compression suits, training tights, and performance activewear. Engineered for speed. Built for champions.",
  keywords: [
    "performance compression suit",
    "elite activewear",
    "speed training suit",
    "athletic compression wear",
    "premium sportswear",
    "DualDeer shop",
  ],
  openGraph: {
    title: "Shop DualDeer — Elite Performance Activewear",
    description: "Carbon-fiber compression suits engineered for world-class athletes.",
    url: "https://www.dualdeer.com/shop",
    siteName: "DualDeer Performance Lab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop DualDeer — Elite Performance Activewear",
    description: "Carbon-fiber compression suits engineered for world-class athletes.",
  },
  alternates: {
    canonical: "https://www.dualdeer.com/shop",
  },
};

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <JsonLd type="organization" />
      <Suspense fallback={<div className="py-32 text-center text-gray-600">Loading products...</div>}>
        <ShopGrid />
      </Suspense>
    </main>
  );
}

