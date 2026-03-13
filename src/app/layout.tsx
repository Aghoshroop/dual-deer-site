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
    default: "DualDeer | Elite Performance Activewear",
    template: "%s | DualDeer",
  },
  description:
    "Discover DualDeer — premium carbon-fiber compression suits engineered for elite speed, endurance, and performance. Worn by world-class athletes. Shop speed suits, compression gear & recovery apparel.",
  keywords: [
    "performance compression suit",
    "elite activewear",
    "speed training suit",
    "athletic compression wear",
    "premium sportswear",
    "DualDeer",
    "carbon fiber suit",
    "compression tights",
    "speed suit",
    "running compression",
    "athletic performance wear",
    "elite sport compression",
  ],
  authors: [{ name: "DualDeer Performance Lab" }],
  creator: "DualDeer Performance Lab",
  publisher: "DualDeer Performance Lab",
  metadataBase: new URL("https://www.dualdeer.com"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
    title: "DualDeer | Elite Performance Activewear",
    description:
      "Premium carbon-fiber compression suits engineered for world-class athletes. Built for those who refuse to slow down.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DualDeer Elite Performance Activewear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DualDeer | Elite Performance Activewear",
    description:
      "Premium carbon-fiber compression suits engineered for world-class athletes.",
    creator: "@dualdeer",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://www.dualdeer.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "sports equipment",
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
