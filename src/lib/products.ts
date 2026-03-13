export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductFeature {
  icon: string;
  title: string;
  body: string;
}

export interface ProductReview {
  name: string;
  rating: number;
  body: string;
  role: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge?: string;
  rating: number;
  reviews: number;
  description: string;
  longDescription: string;
  accentColor: string;
  sizes: string[];
  technology: string[];
  inStock: boolean;
  images: string[]; // image IDs (IndexedDB) or alt text descriptors
  colors: ProductColor[];
  features: ProductFeature[];
  reviewsList: ProductReview[];
  related: string[]; // slugs
}

export interface DiscountCode {
  code: string;
  discount: number; // numeric value
  type: "percent" | "fixed";
  usage: string;
  active: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  accentColor: string;
  announcementText: string;
  showAnnouncement: boolean;
  /** Optional image (base64 data URL or imageStore ID) for the Performance Architecture section */
  performanceImage?: string;
}

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "speed-suit-apex",
    name: "DualDeer Speed Suit — Apex",
    price: 349,
    originalPrice: 399,
    category: "Speed Suits",
    badge: "BEST SELLER",
    rating: 4.9,
    reviews: 124,
    description: "The original flagship. Zero-drag carbon-fiber weave engineered for elite velocity.",
    longDescription:
      "Built from 64-layer carbon micro-fiber, the Apex Speed Suit is the culmination of 3 years of biomechanics research and elite athlete collaboration. Wind-tunnel tested to achieve a 0.04 cd drag coefficient — the lowest of any compression suit on the market.",
    accentColor: "#9D4DFF",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    technology: ["Carbon Fiber Weave", "Breathable Mesh Zones", "Dynamic Compression", "Muscle Support Zones"],
    inStock: true,
    images: ["DualDeer Speed Suit Apex black front view", "DualDeer Speed Suit Apex side compression view", "DualDeer Speed Suit Apex fabric detail", "DualDeer Speed Suit Apex athlete sprint"],
    colors: [
      { name: "Void Black", hex: "#0a0512" },
      { name: "Phantom Violet", hex: "#3d0a8a" },
      { name: "Carbon Gray", hex: "#1f1f2e" },
    ],
    features: [
      { icon: "⚡", title: "Carbon Fiber Compression", body: "64-layer micro-carbon weave delivers 360° graduated compression that locks muscles in optimal activation position across every movement plane." },
      { icon: "🌬️", title: "Breathable Mesh Zones", body: "Strategically placed mesh panels at 12 high-heat zones allow airflow without compromising structural integrity or aerodynamic profile." },
      { icon: "💪", title: "Dynamic Muscle Support", body: "Our proprietary Quad-Mapping algorithm places compression zones precisely where your muscle groups need them most during explosive output." },
      { icon: "💧", title: "Sweat Control Fabric", body: "Hydrophobic silver-ion treatment pulls moisture outward at 3x the rate of standard compression fabric, keeping your core temperature stable." },
    ],
    reviewsList: [
      { name: "Marcus V.", rating: 5, body: "The Apex completely changed how I train. I PRed my 100m by 0.3 seconds in the first week. The compression is unlike anything I've worn.", role: "Olympic Sprint Qualifier" },
      { name: "Kezia R.", rating: 5, body: "Worth every cent. I've tried Lululemon, Nike, Under Armour — nothing compares. The fabric feels like a second skin.", role: "CrossFit Athlete" },
      { name: "Jordan T.", rating: 5, body: "Got mine in carbon gray. The fit is perfect, the quality is insane. Wore it for a full triathlon and it held shape the entire time.", role: "Elite Triathlete" },
    ],
    related: ["speed-suit-stealth", "speed-suit-phantom", "elite-compression-top"],
  },
  {
    id: 2,
    slug: "speed-suit-stealth",
    name: "DualDeer Speed Suit — Stealth",
    price: 329,
    category: "Speed Suits",
    rating: 4.8,
    reviews: 87,
    description: "Matte-finish stealth edition. Maximum performance, invisible profile.",
    longDescription:
      "The Stealth edition features the same carbon performance core as the Apex, wrapped in a matte-black silicone-coated exterior that eliminates surface drag and light reflection. Designed for athletes who perform in silence.",
    accentColor: "#6A00FF",
    sizes: ["XS", "S", "M", "L", "XL"],
    technology: ["Carbon Fiber Weave", "Silicone Matte Coat", "Compression Mapping"],
    inStock: true,
    images: ["DualDeer Speed Suit Stealth matte black front", "DualDeer Speed Suit Stealth back detail", "DualDeer Speed Suit Stealth fabric closeup"],
    colors: [
      { name: "Stealth Black", hex: "#080808" },
      { name: "Midnight Navy", hex: "#070b1a" },
    ],
    features: [
      { icon: "🔲", title: "Silicone Matte Coat", body: "The exterior silicone coating eliminates all surface light reflection and reduces aerodynamic turbulence at speeds above 20km/h." },
      { icon: "⚡", title: "Carbon Fiber Weave", body: "Identical carbon compression substrate to the Apex — same elite performance in a blacked-out profile." },
      { icon: "📐", title: "Compression Mapping", body: "16-point body scan compression distribution ensures no pressure point misalignment during any range of motion." },
      { icon: "🌡️", title: "Thermal Regulation", body: "Phase-change polymer lining maintains skin temperature within 1°C of target across a 15°C ambient range." },
    ],
    reviewsList: [
      { name: "Alexei P.", rating: 5, body: "The stealth edition is absolutely stunning in person. Performance matches the Apex exactly. Understated but elite.", role: "400m Sprinter" },
      { name: "Priya N.", rating: 4, body: "Love the fit, love the fabric. The matte finish is premium. Dropped 1 star only because the XS runs very slim.", role: "Track & Field Coach" },
      { name: "Damian G.", rating: 5, body: "I train in silence. This suit understands that.", role: "Military Performance Athlete" },
    ],
    related: ["speed-suit-apex", "speed-suit-phantom", "carbon-training-tights"],
  },
  {
    id: 3,
    slug: "elite-compression-top",
    name: "Elite Compression Top",
    price: 189,
    category: "Compression",
    badge: "NEW",
    rating: 4.7,
    reviews: 210,
    description: "Targeted upper-body compression for peak muscle activation.",
    longDescription:
      "The Elite Compression Top uses a 4-zone graduated pressure system targeting the shoulders, lats, and core. Engineered to reduce muscle vibration during explosive movements and accelerate recovery between sets.",
    accentColor: "#C084FF",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    technology: ["4-Zone Compression", "Breathable Mesh Zones", "Moisture Wicking"],
    inStock: true,
    images: ["DualDeer Elite Compression Top front view", "DualDeer Elite Compression Top shoulder detail", "DualDeer Elite Compression Top athlete lifting"],
    colors: [
      { name: "Arctic White", hex: "#e8e8f0" },
      { name: "Void Black", hex: "#0a0512" },
      { name: "Royal Violet", hex: "#4a0099" },
    ],
    features: [
      { icon: "🎯", title: "4-Zone Compression", body: "Graduated pressure targets shoulders (40mmHg), lats (35mmHg), chest (30mmHg), and core (25mmHg) independently for optimal zone-specific support." },
      { icon: "🌬️", title: "Breathable Mesh Zones", body: "Underarm and side panel mesh construction allows full ventilation during overhead movements without sacrificing shoulder compression." },
      { icon: "💧", title: "Moisture Wicking", body: "Advanced polyester-elastane blend moves sweat outward at 2.8x the rate of cotton, keeping your skin temperature regulated." },
      { icon: "🔄", title: "360° Stretch Recovery", body: "4-way stretch fabric returns to exact original dimensions after 100,000+ extension cycles — built to last your entire career." },
    ],
    reviewsList: [
      { name: "Sofia M.", rating: 5, body: "Best compression top I've ever owned. The shoulder support during heavy presses is unreal. Recovery time cut in half.", role: "Powerlifter" },
      { name: "Liam B.", rating: 5, body: "Ordered the arctic white. Arrived perfect. The compression zones are exactly where I need them for rowing.", role: "Olympic Rower" },
      { name: "Hannah K.", rating: 4, body: "Great product. The lavender colorway is gorgeous. Sizing up one size gives the perfect compression fit.", role: "Gymnastics Coach" },
    ],
    related: ["heatmap-compression-set", "carbon-training-tights", "speed-suit-apex"],
  },
  {
    id: 4,
    slug: "carbon-training-tights",
    name: "Carbon Training Tights",
    price: 229,
    originalPrice: 259,
    category: "Training",
    rating: 4.8,
    reviews: 96,
    description: "Dynamic compression mapping from hip to ankle for lower body performance.",
    longDescription:
      "The Carbon Training Tights feature our proprietary Quad Mapping technology — 64 individual compression zones targeting the quads, hamstrings, calves, and IT band. Reduce oscillation, increase power transfer, recover faster.",
    accentColor: "#00E5FF",
    sizes: ["XS", "S", "M", "L", "XL"],
    technology: ["Quad Mapping", "Carbon Core", "Anti-Odor Layer"],
    inStock: true,
    images: ["DualDeer Carbon Training Tights front", "DualDeer Carbon Training Tights compression detail", "DualDeer Carbon Training Tights athlete running"],
    colors: [
      { name: "Carbon Black", hex: "#111118" },
      { name: "Neon Aqua", hex: "#003d45" },
    ],
    features: [
      { icon: "🦵", title: "Quad Mapping Technology", body: "64 individual compression panels mapped to your quad, hamstring, calf, and IT band anatomy — each calibrated to the exact pressure for peak performance." },
      { icon: "⚡", title: "Carbon Core Substrate", body: "Carbon micro-fiber running through the core of each compression panel creates a rigid energy-return track that channels leg drive through the full stride cycle." },
      { icon: "🧪", title: "Anti-Odor Layer", body: "Dual-layer silver-ion treatment neutralizes bacteria at the fabric surface, eliminating odor through even 3-hour HIIT sessions." },
      { icon: "🔒", title: "No-Roll Waistband", body: "8cm deep compression waistband with internal silicone grip track. Stays in place through deadlifts, sprints, and box jumps — guaranteed." },
    ],
    reviewsList: [
      { name: "Carlos E.", rating: 5, body: "The leg compression is insane — in the best way. My quads feel supported from warm-up to cool-down. PRed my squat wearing these.", role: "Strength & Conditioning Coach" },
      { name: "Anna L.", rating: 5, body: "I run marathons. These are the best tights on the market for long-distance. The calf compression alone is worth the price.", role: "Marathon Runner" },
      { name: "Devon H.", rating: 4, body: "Quality is top tier. The neon aqua colorway is stunning. Wish they had more color options.", role: "HIIT Trainer" },
    ],
    related: ["heatmap-compression-set", "performance-shorts", "elite-compression-top"],
  },
  {
    id: 5,
    slug: "performance-shorts",
    name: "Performance Shorts",
    price: 129,
    category: "Training",
    rating: 4.6,
    reviews: 178,
    description: "Breathable, built for speed. Deep compression waistband for total stability.",
    longDescription:
      "Designed for HIIT, track sprints, and gym sessions, the Performance Shorts pair a 360° breathable mesh outer layer with a built-in compression liner. The deep 4-inch waistband locks your core in place through every explosive movement.",
    accentColor: "#9D4DFF",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    technology: ["Breathable Mesh", "Compression Liner", "Anti-Chafe Seams"],
    inStock: true,
    images: ["DualDeer Performance Shorts front view", "DualDeer Performance Shorts side view", "DualDeer Performance Shorts waistband detail"],
    colors: [
      { name: "Void Black", hex: "#0a0512" },
      { name: "Heather Gray", hex: "#2a2a35" },
      { name: "Deep Purple", hex: "#250040" },
    ],
    features: [
      { icon: "🌬️", title: "360° Breathable Mesh", body: "Full-perimeter mesh outer layer allows complete airflow around the thighs, reducing heat accumulation during maximal-intensity intervals." },
      { icon: "🩱", title: "Built-In Compression Liner", body: "4-inch inseam compression shorts liner built directly into the outer shell — no shifting, no bunching, zero chafing across any movement." },
      { icon: "🧵", title: "Anti-Chafe Seams", body: "Flatlock seam construction eliminates raised edges at friction points — tested across 200km of sprinting, jumping, and lateral movement." },
      { icon: "🔒", title: "Deep Waistband Lock", body: "4-inch silicone-grip waistband maintains position through Olympic lifts, box jumps, and stadium stairs — no readjusting required." },
    ],
    reviewsList: [
      { name: "Rami O.", rating: 5, body: "The compression liner is perfect — not too tight, not too loose. These are my go-to shorts for everything now.", role: "Sprints & Jumps Specialist" },
      { name: "Tia W.", rating: 4, body: "Love the fit. Great waistband. Would love a 7-inch inseam option for taller athletes.", role: "Volleyball Player" },
      { name: "Ben C.", rating: 5, body: "I've worn these for 3 months straight (not literally). They still look brand new. The quality is premium.", role: "Personal Trainer" },
    ],
    related: ["carbon-training-tights", "muscle-recovery-sleeve", "elite-compression-top"],
  },
  {
    id: 6,
    slug: "muscle-recovery-sleeve",
    name: "Muscle Recovery Sleeve",
    price: 89,
    category: "Accessories",
    rating: 4.5,
    reviews: 63,
    description: "Post-workout graduated compression for accelerated muscle recovery.",
    longDescription:
      "Engineered for the 48 hours after training. The Recovery Sleeve uses a 3-stage graduated compression from ankle to knee, promoting venous return and reducing the inflammation that causes delayed onset muscle soreness.",
    accentColor: "#6A00FF",
    sizes: ["S/M", "L/XL"],
    technology: ["Graduated Compression", "Far-Infrared Fabric"],
    inStock: true,
    images: ["DualDeer Muscle Recovery Sleeve pair", "DualDeer Muscle Recovery Sleeve ankle detail"],
    colors: [
      { name: "Void Black", hex: "#0a0512" },
      { name: "Compression White", hex: "#f0f0f8" },
    ],
    features: [
      { icon: "🩸", title: "3-Stage Graduated Compression", body: "40mmHg at ankle grading to 20mmHg at knee — the clinically validated range for maximizing venous blood return to the heart post-exercise." },
      { icon: "🌡️", title: "Far-Infrared Fabric", body: "Ceramic-coated infrared fiber reflects body heat back as 8-14μm far-infrared radiation — shown to increase local blood flow by up to 18%." },
      { icon: "😴", title: "Recovery While You Sleep", body: "Low-profile flat design allows comfortable overnight wear — maximize recovery during your most anabolic window." },
      { icon: "⚗️", title: "Silver-Ion Treatment", body: "Anti-microbial coating prevents bacterial growth through 80+ machine wash cycles without degrading compression properties." },
    ],
    reviewsList: [
      { name: "Yuki S.", rating: 5, body: "I wear these after every leg day. DOMS has basically halved since I started. I've told everyone on my team.", role: "Cycling Team Captain" },
      { name: "Grace F.", rating: 4, body: "Really effective. I sleep in them after heavy lower body sessions. The fabric is comfortable overnight.", role: "Olympic Weightlifter" },
      { name: "Tom R.", rating: 4, body: "Good compression, noticeable difference in next-day soreness. Worth buying two pairs.", role: "Ultra Marathon Runner" },
    ],
    related: ["carbon-training-tights", "performance-shorts", "heatmap-compression-set"],
  },
  {
    id: 7,
    slug: "speed-suit-phantom",
    name: "Speed Suit — Phantom",
    price: 379,
    category: "Speed Suits",
    badge: "ELITE",
    rating: 5.0,
    reviews: 41,
    description: "Our most advanced suit. Custom athlete compression mapping.",
    longDescription:
      "The Phantom is our pinnacle engineering achievement. Built to individual athlete specifications using AI-generated compression maps derived from motion capture analysis. Every panel is placed for your unique biomechanics.",
    accentColor: "#C084FF",
    sizes: ["Custom"],
    technology: ["AI Compression Map", "Carbon Fiber Weave", "Photon-Reflective Coating"],
    inStock: true,
    images: ["DualDeer Speed Suit Phantom elite edition front", "DualDeer Speed Suit Phantom reflective detail", "DualDeer Speed Suit Phantom athlete action", "DualDeer Speed Suit Phantom fabric close"],
    colors: [
      { name: "Photon Black", hex: "#05050f" },
      { name: "Phantom Violet", hex: "#1a0040" },
    ],
    features: [
      { icon: "🤖", title: "AI Compression Mapping", body: "24-point motion capture session generates a unique biomechanical profile. Our AI places each of 128 compression panels exactly where your body needs it." },
      { icon: "⚡", title: "Carbon Fiber Weave", body: "Military-grade carbon micro-fiber in a proprietary hexagonal lattice — 40% greater tensile strength than the Apex with 12% less mass." },
      { icon: "🌟", title: "Photon-Reflective Coating", body: "Nano-ceramic exterior reflects 94% of visible light. In motion, the Phantom appears to shift shade — a signature effect developed with automotive paint engineers." },
      { icon: "🔬", title: "Bioelectric Interface", body: "Embedded silver-thread sensors at 6 compression zones collect muscle activation data compatible with DualDeer's performance analytics platform." },
    ],
    reviewsList: [
      { name: "Elijah C.", rating: 5, body: "I've trained in custom suits for my entire career. The Phantom is in a completely different league. The custom fit is surgical.", role: "World Championship Sprinter" },
      { name: "Naomi W.", rating: 5, body: "The AI mapping session alone was worth it. I didn't know how wrong my previous compression was until this suit showed me.", role: "National Team Decathlete" },
      { name: "Viktor B.", rating: 5, body: "Every panel hits exactly the right spot. It's like wearing a performance upgrade, not clothing.", role: "100m National Record Holder" },
    ],
    related: ["speed-suit-apex", "speed-suit-stealth", "heatmap-compression-set"],
  },
  {
    id: 8,
    slug: "heatmap-compression-set",
    name: "HeatMap Compression Set",
    price: 289,
    originalPrice: 319,
    category: "Compression",
    badge: "SALE",
    rating: 4.9,
    reviews: 72,
    description: "Full-body heatmap compression system. Top + tights bundled.",
    longDescription:
      "The complete HeatMap system — our Elite Compression Top and Carbon Training Tights sold together with a matched compression gradient. Engineered to work as a synchronized system for total body performance optimization.",
    accentColor: "#00E5FF",
    sizes: ["XS", "S", "M", "L", "XL"],
    technology: ["Matched Compression System", "Carbon Core", "Moisture Wicking"],
    inStock: true,
    images: ["DualDeer HeatMap Compression Set full outfit front", "DualDeer HeatMap Compression Set detail", "DualDeer HeatMap Compression Set athlete"],
    colors: [
      { name: "Aqua Void", hex: "#001a1f" },
      { name: "Carbon Black", hex: "#111118" },
    ],
    features: [
      { icon: "🔗", title: "Synchronized Compression System", body: "Top and tights are engineered with matching gradient profiles — creating a seamless full-body compression map from wrist to ankle." },
      { icon: "⚡", title: "Carbon Core Construction", body: "Both garments feature the same military-grade carbon micro-fiber substrate — reducing total mass by 18% versus a separate top + tights purchase." },
      { icon: "💧", title: "Full-Body Moisture Management", body: "Coordinated hydrophobic treatment across both garments moves sweat from all zones simultaneously, preventing any wet-spot accumulation." },
      { icon: "💰", title: "Bundled Value", body: "Purchasing the HeatMap Set saves $81 versus buying the Elite Compression Top and Carbon Training Tights separately at full price." },
    ],
    reviewsList: [
      { name: "Isaac M.", rating: 5, body: "The coordinated feel across both garments is incredible. It's like having a full suit without the suit. Perfect.", role: "Functional Fitness Competitor" },
      { name: "Elena D.", rating: 5, body: "The aqua void colorway is absolutely stunning. I get compliments at every session. Performance is elite.", role: "Fitness Model & Coach" },
      { name: "Ryan P.", rating: 5, body: "Best value in the entire lineup. I wear the HeatMap set for every competition. It's become my ritual.", role: "Obstacle Course Racing Champion" },
    ],
    related: ["elite-compression-top", "carbon-training-tights", "speed-suit-apex"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return DEFAULT_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return DEFAULT_PRODUCTS;
  return DEFAULT_PRODUCTS.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product): Product[] {
  return product.related
    .map((slug) => DEFAULT_PRODUCTS.find((p) => p.slug === slug))
    .filter(Boolean) as Product[];
}

// Backward compat alias
export const PRODUCTS = DEFAULT_PRODUCTS;

export const CATEGORIES = ["All", "Speed Suits", "Compression", "Training", "Accessories"];
