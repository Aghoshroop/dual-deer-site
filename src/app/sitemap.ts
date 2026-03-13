import { MetadataRoute } from "next";
import { DEFAULT_PRODUCTS } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.dualdeer.com";
  const now = new Date();

  // Core pages — priority mapped to SEO value
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.98 },
    { url: `${baseUrl}/story`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    // Category pages — high priority transactional
    { url: `${baseUrl}/shop?cat=Speed+Suits`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/shop?cat=Compression`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/shop?cat=Training`, lastModified: now, changeFrequency: "weekly", priority: 0.82 },
    { url: `${baseUrl}/shop?cat=Accessories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Auth (low priority — no SEO value for crawlers)
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Product pages — highest product-level priority
  const productUrls: MetadataRoute.Sitemap = DEFAULT_PRODUCTS.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.92,
    images: [`${baseUrl}/og-image.png`],
  }));

  return [...staticPages, ...productUrls];
}
