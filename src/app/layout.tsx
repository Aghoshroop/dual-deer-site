import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import AIAgent from "@/components/AIAgent";
import UXUtilities from "@/components/UXUtilities";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "DualDeer | #1 Best Activewear & Performance Compression Suits Online",
    template: "%s | DualDeer — Best Activewear Online",
  },
  description:
    "DualDeer is rated the #1 best activewear brand online. Shop elite carbon-fiber compression suits, speed suits, training tights, and recovery gear — engineered for world-class athletes. Free shipping over $200.",
  keywords: [
    // Brand
    "DualDeer", "DualDeer performance lab", "DualDeer activewear",
    // Best activewear intent
    "best activewear online", "best activewear brand", "top rated activewear", "best performance activewear",
    "best activewear 2024", "best activewear 2025", "best activewear for athletes",
    // Compression suits
    "best compression suit", "elite compression suit", "performance compression suit",
    "compression suit for running", "compression suit for athletes", "athletic compression wear",
    "carbon fiber compression suit", "speed suit compression",
    // Speed suits
    "speed suit", "speed training suit", "elite speed suit", "best speed suit online",
    "performance speed suit", "sprint suit",
    // Sportswear / activewear
    "premium sportswear", "elite sportswear", "performance sportswear online",
    "luxury activewear", "high performance activewear", "activewear for elite athletes",
    "buy activewear online", "shop performance sportswear",
    // Product-level
    "compression tights", "training tights", "compression top", "athletic shorts",
    "muscle recovery sleeve", "recovery compression gear",
    // Tech-driven intent
    "carbon fiber sportswear", "AI biomechanics activewear", "zero drag compression suit",
    "wind tunnel tested sportswear",
  ],
  authors: [{ name: "DualDeer Performance Lab" }],
  creator: "DualDeer Performance Lab",
  publisher: "DualDeer Performance Lab",
  applicationName: "DualDeer Performance Lab",
  referrer: "origin-when-cross-origin",
  metadataBase: new URL("https://www.dualdeer.com"),
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.dualdeer.com",
    siteName: "DualDeer Performance Lab",
    title: "DualDeer | #1 Best Activewear & Performance Compression Suits Online",
    description:
      "The best activewear brand online — elite carbon-fiber compression suits and speed suits engineered for world-class athletes. Rated #1 for performance sportswear.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DualDeer — Best Performance Activewear Online",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@dualdeer",
    title: "DualDeer | #1 Best Activewear & Performance Compression Suits Online",
    description:
      "The best activewear brand online. Elite carbon-fiber compression suits engineered for world-class athletes.",
    creator: "@dualdeer",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://www.dualdeer.com",
    languages: {
      "en-US": "https://www.dualdeer.com",
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "sports equipment",
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#050508" />
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Preload critical fonts */}
        <link rel="preload" as="font" href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2" type="font/woff2" crossOrigin="anonymous" />
        {/* Self-healing: clear corrupt product data before React mounts */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var stored = JSON.parse(localStorage.getItem('dd_products_v2') || 'null');
              if (stored && Array.isArray(stored)) {
                var corrupt = stored.some(function(p){
                  return !p || !Array.isArray(p.images) || !p.accentColor || !p.id;
                });
                if (corrupt) { localStorage.removeItem('dd_products_v2'); }
              }
            } catch(e) { localStorage.removeItem('dd_products_v2'); }
          })();
        ` }} />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} bg-background text-foreground antialiased`}
        style={{ fontFamily: "var(--font-inter, Inter), sans-serif" }}
      >
        <AuthProvider>
          <CartProvider>
            <UXUtilities />
            <Navbar />
            <CartDrawer />
            <AIAgent />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
