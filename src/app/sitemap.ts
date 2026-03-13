import { MetadataRoute } from "next";
import { DEFAULT_PRODUCTS } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.dualdeer.com";
  const now = new Date();

  // Core pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/shop?cat=Speed Suits`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/shop?cat=Compression`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/shop?cat=Training`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/shop?cat=Recovery`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/checkout`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Product pages — default products (admin-added products are localStorage-only, can't be server-crawled)
  const productUrls: MetadataRoute.Sitemap = DEFAULT_PRODUCTS.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...productUrls];
}
