import type { Metadata } from "next";
import HeroSequence from "@/components/HeroSequence";
import FeaturedCollection from "@/components/FeaturedCollection";
import BrandStory from "@/components/BrandStory";
import ShopGrid from "@/components/ShopGrid";
import PerformanceSection from "@/components/PerformanceSection";
import FabricTechSection from "@/components/FabricTechSection";

import CustomerReviews from "@/components/CustomerReviews";
import NewsletterSection from "@/components/NewsletterSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import DiscountPopup from "@/components/DiscountPopup";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "DualDeer Speed Suit — Elite Performance Activewear",
  description:
    "Discover the DualDeer Speed Suit — premium compression activewear engineered for speed, comfort, and performance. Carbon-fiber weave. AI biomechanics. Zero-drag profile.",
  keywords: [
    "performance compression suit",
    "elite activewear",
    "speed training suit",
    "athletic compression wear",
    "premium sportswear",
    "DualDeer speed suit",
  ],
  alternates: {
    canonical: "https://www.dualdeer.com",
  },
};

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd type="organization" />
      <JsonLd type="website" />

      {/* Marketing popup */}
      <DiscountPopup />

      {/* 1. Cinematic scroll hero — 240-frame animation */}
      <HeroSequence />

      {/* 2. Featured Collection */}
      <FeaturedCollection />

      {/* 3. Brand Story — parallax */}
      <BrandStory />

      {/* 4. Shop Grid */}
      <ShopGrid />

      {/* 5. Performance */}
      <PerformanceSection />

      {/* 6. Fabric Technology */}
      <FabricTechSection />



      {/* 9. Reviews */}
      <CustomerReviews />

      {/* 10. Newsletter */}
      <NewsletterSection />

      {/* 11. CTA */}
      <CTASection />

      {/* 12. Footer */}
      <Footer />
    </main>
  );
}
