interface OrganizationSchemaProps {
  type: "organization";
}

interface WebsiteSchemaProps {
  type: "website";
}

interface ProductSchemaProps {
  type: "product";
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  slug: string;
}

type JsonLdProps = OrganizationSchemaProps | WebsiteSchemaProps | ProductSchemaProps;

const BASE_URL = "https://www.dualdeer.com";

function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DualDeer Performance Lab",
    url: BASE_URL,
    logo: `${BASE_URL}/dualdeer-logo.png`,
    sameAs: [
      "https://www.instagram.com/dualdeer",
      "https://twitter.com/dualdeer",
    ],
    description:
      "DualDeer Performance Lab engineers elite compression activewear and speed suits for world-class athletes.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
  };
}

function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DualDeer Performance Lab",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function buildProductSchema(props: ProductSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: props.name,
    description: props.description,
    brand: {
      "@type": "Brand",
      name: "DualDeer",
    },
    url: `${BASE_URL}/product/${props.slug}`,
    offers: {
      "@type": "Offer",
      price: props.price.toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "DualDeer Performance Lab",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: props.rating.toString(),
      reviewCount: props.reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export default function JsonLd(props: JsonLdProps) {
  let schema: object;

  if (props.type === "organization") {
    schema = buildOrganizationSchema();
  } else if (props.type === "website") {
    schema = buildWebsiteSchema();
  } else {
    schema = buildProductSchema(props);
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
