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
import { HomePageSchemas } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "DualDeer | #1 Best Activewear — Elite Compression Suits & Speed Suits",
  description:
    "Shop the #1 best activewear brand online. DualDeer carbon-fiber compression suits, speed suits & training tights are engineered for elite athletes. Free shipping on orders over $200.",
  keywords: [
    "best activewear online", "best activewear brand", "best compression suit",
    "elite activewear", "speed training suit", "performance compression suit",
    "DualDeer speed suit", "buy performance sportswear online",
    "top rated activewear", "best activewear for athletes",
    "carbon fiber compression suit", "luxury activewear brand",
  ],
  alternates: {
    canonical: "https://www.dualdeer.com",
  },
  openGraph: {
    title: "DualDeer | #1 Best Activewear — Elite Compression Suits & Speed Suits",
    description:
      "Shop the #1 best activewear brand online. Carbon-fiber compression suits and speed suits engineered for elite athletes.",
    url: "https://www.dualdeer.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DualDeer Best Activewear" }],
  },
};

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      {/* JSON-LD Structured Data — all homepage schemas */}
      <HomePageSchemas />

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
