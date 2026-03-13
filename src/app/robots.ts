import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/product/", "/story", "/contact"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/_next/",
          "/checkout",
          "/login",
          "/register",
        ],
      },
      // Block all known AI training scrapers to protect brand content
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "Claude-Web", disallow: "/" },
      { userAgent: "cohere-ai", disallow: "/" },
      { userAgent: "FacebookBot", disallow: "/" },
      { userAgent: "PerplexityBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "PetalBot", disallow: "/" },
      { userAgent: "Amazonbot", disallow: "/" },
    ],
    sitemap: "https://www.dualdeer.com/sitemap.xml",
    host: "https://www.dualdeer.com",
  };
}
