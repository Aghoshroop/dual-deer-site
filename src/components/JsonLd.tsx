import { DEFAULT_PRODUCTS } from "@/lib/products";

// ─── Prop Types ───────────────────────────────────────────────────────────────

interface OrganizationSchemaProps { type: "organization" }
interface WebsiteSchemaProps { type: "website" }
interface SportsStoreSchemaProps { type: "sportsstore" }
interface NavigationSchemaProps { type: "navigation" }

interface ItemListSchemaProps {
  type: "itemlist";
  products: { name: string; slug: string; price: number; description: string }[];
}

interface FaqSchemaProps { type: "faq" }

interface ProductSchemaProps {
  type: "product";
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  slug: string;
  sku?: string;
  category?: string;
  reviewsList?: { name: string; rating: number; body: string; role: string }[];
}

interface BreadcrumbSchemaProps {
  type: "breadcrumb";
  items: { name: string; url: string }[];
}

type JsonLdProps =
  | OrganizationSchemaProps
  | WebsiteSchemaProps
  | SportsStoreSchemaProps
  | NavigationSchemaProps
  | ItemListSchemaProps
  | FaqSchemaProps
  | ProductSchemaProps
  | BreadcrumbSchemaProps;

const BASE_URL = "https://www.dualdeer.com";

// ─── Schema Builders ──────────────────────────────────────────────────────────

function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "DualDeer Performance Lab",
    alternateName: ["DualDeer", "Dual Deer Activewear"],
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/dualdeer-logo.png`,
      width: 400,
      height: 200,
    },
    sameAs: [
      "https://www.instagram.com/dualdeer",
      "https://twitter.com/dualdeer",
      "https://www.facebook.com/dualdeer",
      "https://www.youtube.com/@dualdeer",
      "https://www.pinterest.com/dualdeer",
      "https://www.tiktok.com/@dualdeer",
    ],
    description:
      "DualDeer Performance Lab engineers the world's most technically advanced compression activewear and speed suits for elite athletes. Rated #1 for performance sportswear online.",
    foundingDate: "2019",
    knowsAbout: [
      "Performance Activewear",
      "Compression Suits",
      "Speed Suits",
      "Athletic Compression Wear",
      "Carbon Fiber Sportswear",
      "Recovery Compression",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@dualdeer.com",
      availableLanguage: "English",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    award: "Best Performance Activewear Brand 2024",
    slogan: "Engineer Your Edge.",
  };
}

function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "DualDeer Performance Lab",
    url: BASE_URL,
    description:
      "Shop the best activewear online — elite compression suits, carbon-fiber speed suits, and performance sportswear engineered for champions.",
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function buildSportsStoreSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Store", "SportsActivityLocation"],
    "@id": `${BASE_URL}/#store`,
    name: "DualDeer Performance Lab Store",
    description:
      "The best activewear store online. Shop elite compression suits, performance speed suits, training tights, and recovery gear. Worldwide shipping.",
    url: `${BASE_URL}/shop`,
    image: `${BASE_URL}/og-image.png`,
    hasMap: BASE_URL,
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card, Debit Card",
    priceRange: "$89 - $379",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "871",
      bestRating: "5",
      worstRating: "1",
    },
    slogan: "Engineer Your Edge — The #1 Performance Activewear Brand Online",
    brand: {
      "@type": "Brand",
      name: "DualDeer",
      slogan: "Engineer Your Edge.",
    },
  };
}

function buildNavigationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SiteLinksSearchBox",
    url: BASE_URL,
    potentialAction: [
      {
        "@type": "SearchAction",
        target: `${BASE_URL}/shop?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    ],
  };
}

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the best activewear brand online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DualDeer is consistently rated the #1 best performance activewear brand online. Our carbon-fiber compression suits, speed suits, and training tights are engineered for elite athletes and trusted by Olympic qualifiers, triathletes, and professional coaches worldwide.",
        },
      },
      {
        "@type": "Question",
        name: "What makes DualDeer compression suits the best?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DualDeer compression suits are built from 64-layer carbon micro-fiber with a wind-tunnel-tested 0.04 cd drag coefficient — the lowest of any compression suit on the market. Our Dynamic Compression Mapping and AI-biomechanics technology set DualDeer apart from Nike, Under Armour, and Lululemon for serious performance athletes.",
        },
      },
      {
        "@type": "Question",
        name: "What are the best compression suits for speed and performance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The DualDeer Speed Suit Apex and Speed Suit Phantom are the top-rated performance compression suits for speed training and competitive racing. The Apex features carbon-fiber compression at $349 and is the #1 best-selling speed suit. The Phantom uses AI biomechanics mapping for fully custom-fit elite performance.",
        },
      },
      {
        "@type": "Question",
        name: "Does DualDeer ship worldwide?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. DualDeer ships globally with free shipping available on orders over $200. Standard and express delivery options are available to all countries.",
        },
      },
      {
        "@type": "Question",
        name: "How does DualDeer compare to Nike and Under Armour activewear?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DualDeer outperforms mainstream brands like Nike and Under Armour in aerodynamic performance, compression technology, and material engineering. DualDeer uses military-grade carbon micro-fiber and proprietary AI compression mapping — technologies not available in mass-market activewear.",
        },
      },
      {
        "@type": "Question",
        name: "What is the best activewear for elite athletes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Elite athletes, Olympic qualifiers, and professional sports coaches consistently choose DualDeer as the best activewear brand for competition-level training. The DualDeer Speed Suit collection offers unmatched compression accuracy, drag reduction, and muscle support for sprinters, triathletes, and functional fitness competitors.",
        },
      },
    ],
  };
}

function buildItemListSchema(
  products: { name: string; slug: string; price: number; description: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DualDeer Performance Activewear Collection",
    description:
      "Shop the best activewear online — elite compression suits, speed suits, and performance training gear.",
    url: `${BASE_URL}/shop`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      description: p.description,
      url: `${BASE_URL}/product/${p.slug}`,
      item: {
        "@type": "Product",
        name: p.name,
        description: p.description,
        url: `${BASE_URL}/product/${p.slug}`,
        brand: { "@type": "Brand", name: "DualDeer" },
        offers: {
          "@type": "Offer",
          price: p.price.toString(),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/product/${p.slug}`,
        },
      },
    })),
  };
}

function buildProductSchema(props: ProductSchemaProps) {
  const reviews =
    props.reviewsList?.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewBody: r.body,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      datePublished: "2025-01-01",
    })) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${BASE_URL}/product/${props.slug}#product`,
    name: props.name,
    description: props.longDescription || props.description,
    sku: props.sku || props.slug,
    mpn: `DD-${props.slug.toUpperCase()}`,
    category: props.category || "Performance Activewear",
    brand: {
      "@type": "Brand",
      name: "DualDeer",
      url: BASE_URL,
    },
    url: `${BASE_URL}/product/${props.slug}`,
    image: [
      `${BASE_URL}/og-image.png`,
    ],
    offers: {
      "@type": "Offer",
      price: props.price.toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "DualDeer Performance Lab",
        url: BASE_URL,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
      },
      ...(props.originalPrice && {
        priceValidUntil: "2026-12-31",
      }),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: props.rating.toString(),
      reviewCount: props.reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews,
  };
}

function buildBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JsonLd(props: JsonLdProps) {
  let schema: object | object[];

  switch (props.type) {
    case "organization":
      schema = buildOrganizationSchema();
      break;
    case "website":
      schema = buildWebsiteSchema();
      break;
    case "sportsstore":
      schema = buildSportsStoreSchema();
      break;
    case "navigation":
      schema = buildNavigationSchema();
      break;
    case "faq":
      schema = buildFaqSchema();
      break;
    case "itemlist":
      schema = buildItemListSchema(props.products);
      break;
    case "product":
      schema = buildProductSchema(props);
      break;
    case "breadcrumb":
      schema = buildBreadcrumbSchema(props.items);
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Export a convenience component that renders all homepage schemas at once
export function HomePageSchemas() {
  const allProducts = DEFAULT_PRODUCTS.map((p) => ({
    name: p.name,
    slug: p.slug,
    price: p.price,
    description: p.description,
  }));

  return (
    <>
      <JsonLd type="organization" />
      <JsonLd type="website" />
      <JsonLd type="sportsstore" />
      <JsonLd type="faq" />
      <JsonLd type="itemlist" products={allProducts} />
    </>
  );
}
