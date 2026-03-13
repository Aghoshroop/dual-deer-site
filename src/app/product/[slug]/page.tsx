import type { Metadata } from "next";
import { DEFAULT_PRODUCTS, getProductBySlug } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import ProductPageClient from "./ProductPageClient";

// ─── Static param generation for pre-rendering all product pages ──────────────

export async function generateStaticParams() {
  return DEFAULT_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

// ─── Per-product metadata for full SSR SEO ────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = DEFAULT_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found | DualDeer",
      description: "This product is not available. Browse our full collection of elite performance activewear.",
      robots: { index: false, follow: true },
    };
  }

  const categoryKeywords: Record<string, string[]> = {
    "Speed Suits": ["speed suit", "best speed suit", "performance speed suit", "elite speed suit", "sprint suit"],
    "Compression": ["compression wear", "best compression top", "athletic compression", "performance compression"],
    "Training": ["training tights", "best training tights", "athletic training gear", "performance training"],
    "Accessories": ["compression sleeve", "recovery sleeve", "muscle recovery", "compression accessories"],
  };

  const catKw = categoryKeywords[product.category] ?? [];

  return {
    title: `${product.name} — Best ${product.category} Online | DualDeer`,
    description: `${product.description} ${product.longDescription.slice(0, 120)}... Rated ${product.rating}/5 by ${product.reviews}+ athletes. Free shipping over $200.`,
    keywords: [
      product.name,
      "DualDeer", "best activewear online", "buy activewear online",
      product.category, `best ${product.category.toLowerCase()}`,
      ...catKw,
      "performance activewear", "elite compression suit", "premium sportswear",
      ...product.technology,
    ],
    openGraph: {
      title: `${product.name} | DualDeer — Best Activewear Online`,
      description: `${product.description} Rated ${product.rating}/5 by ${product.reviews}+ elite athletes.`,
      url: `https://www.dualdeer.com/product/${product.slug}`,
      siteName: "DualDeer Performance Lab",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${product.name} — DualDeer Best Activewear`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | DualDeer`,
      description: `${product.description} Rated ${product.rating}/5 by ${product.reviews}+ athletes.`,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `https://www.dualdeer.com/product/${product.slug}`,
    },
  };
}

// ─── Server Component Page ─────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Static lookup — always resolves default products server-side for SEO
  const product = DEFAULT_PRODUCTS.find((p) => p.slug === slug) ?? null;

  const relatedProducts = product
    ? product.related
        .map((s) => DEFAULT_PRODUCTS.find((p) => p.slug === s))
        .filter(Boolean)
    : [];

  return (
    <>
      {product && (
        <>
          {/* Product Schema — full rich result with reviews and shipping */}
          <JsonLd
            type="product"
            name={product.name}
            description={product.description}
            longDescription={product.longDescription}
            price={product.price}
            originalPrice={product.originalPrice}
            rating={product.rating}
            reviewCount={product.reviews}
            slug={product.slug}
            category={product.category}
            reviewsList={product.reviewsList}
          />
          {/* Breadcrumb */}
          <JsonLd
            type="breadcrumb"
            items={[
              { name: "Home", url: "https://www.dualdeer.com" },
              { name: "Shop", url: "https://www.dualdeer.com/shop" },
              { name: product.category, url: `https://www.dualdeer.com/shop?cat=${encodeURIComponent(product.category)}` },
              { name: product.name, url: `https://www.dualdeer.com/product/${product.slug}` },
            ]}
          />
        </>
      )}
      {/* Client component handles all interactivity; it also does a dynamic store lookup
          to show admin-added products that won't be in DEFAULT_PRODUCTS */}
      <ProductPageClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        product={product as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        relatedProducts={relatedProducts as any}
      />
    </>
  );
}
