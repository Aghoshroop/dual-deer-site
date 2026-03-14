import type { Metadata } from "next";

import HeroSequence from "@/components/HeroSequence";
import FeaturedCollection from "@/components/FeaturedCollection";
import BrandStory from "@/components/BrandStory";
import HomeBestsellers from "@/components/HomeBestsellers";
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
    "Shop the #1 best activewear brand online. DualDeer compression suits engineered for elite athletes.",
};

export default function Home() {
  return (
    <main className="bg-background min-h-screen">

      <HomePageSchemas />

      <DiscountPopup />

      <HeroSequence />

      <FeaturedCollection />

      <BrandStory />

      <HomeBestsellers />

      <PerformanceSection />

      <FabricTechSection />

      <CustomerReviews />

      <NewsletterSection />

      <CTASection />

      <Footer />

    </main>
  );
}