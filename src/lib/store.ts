/**
 * DualDeer Dynamic Store
 * All data stored in localStorage — zero cost, no backend needed.
 * Automatically seeds from DEFAULT_PRODUCTS on first load.
 *
 * NOTE: Firebase is imported DYNAMICALLY inside async functions only.
 * This keeps this module fully SSR-safe (no browser-only code at module level).
 */

import { DEFAULT_PRODUCTS, Product, DiscountCode, SiteSettings } from "./products";

const KEYS = {
  PRODUCTS: "dd_products_v2",
  DISCOUNTS: "dd_discounts_v2",
  SETTINGS: "dd_settings_v2",
  OFFERS: "dd_offers_v2",
  ORDERS: "dd_orders_v1",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  active: boolean;
  createdAt: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  size: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  placedAt: number;
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryPrice: number;
  discountAmount: number;
  total: number;
  deliveryMethod: string;
  paymentMethod: string;
  status: "new" | "processing" | "shipped" | "delivered";
  read: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("[store] localStorage write failed:", e);
  }
}

/** Strips fields with `undefined` values — Firestore rejects them. */
function sanitize<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/** Lazy firebase getter — only imports when called (client-only) */
async function getFirebase() {
  const [{ db }, { doc, collection, setDoc, deleteDoc, onSnapshot }] = await Promise.all([
    import("./firebase"),
    import("firebase/firestore"),
  ]);
  return { db, doc, collection, setDoc, deleteDoc, onSnapshot };
}

// ─── Product Store ─────────────────────────────────────────────────────────────

/** Ensure all arrays and required fields exist to prevent undefined crashes */
function normalizeProduct(p: Partial<Product>): Product {
  return {
    ...p,
    images: Array.isArray(p.images) ? p.images : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : ["S", "M", "L", "XL"],
    technology: Array.isArray(p.technology) ? p.technology : [],
    related: Array.isArray(p.related) ? p.related : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    features: Array.isArray(p.features) ? p.features : [],
    reviewsList: Array.isArray(p.reviewsList) ? p.reviewsList : [],
    accentColor: p.accentColor || "#9D4DFF",
    rating: p.rating || 4.5,
    reviews: p.reviews || 0,
    inStock: typeof p.inStock === "boolean" ? p.inStock : true,
    name: p.name || "Product",
    slug: p.slug || `product-${p.id}`,
    category: p.category || "Performance Gear",
    description: p.description || "",
    longDescription: p.longDescription || "",
    id: p.id || Date.now(),
    price: p.price || 0,
  } as Product;
}

export function getProducts(): Product[] {
  const stored = load<Product[] | null>(KEYS.PRODUCTS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    save(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
  const hasCorruptData = stored.some(
    (p) => !p || !Array.isArray((p as Product).images)
  );
  if (hasCorruptData) {
    console.warn("[store] Detected corrupt product data in localStorage — reseeding from defaults.");
    save(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
  return stored.map(normalizeProduct);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  const all = getProducts();
  if (category === "All") return all;
  return all.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product): Product[] {
  const all = getProducts();
  return product.related
    .map((slug) => all.find((p) => p.slug === slug))
    .filter(Boolean) as Product[];
}

export async function saveProduct(product: Product): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { db, doc, setDoc } = await getFirebase();
    const ref = doc(db, "products", product.id.toString());
    await setDoc(ref, sanitize(product));
  } catch (e) {
    console.error("Failed to save product to Firestore", e);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { db, doc, deleteDoc } = await getFirebase();
    const ref = doc(db, "products", String(id));
    await deleteDoc(ref);
  } catch (e) {
    console.error("Failed to delete product from Firestore", e);
  }
}

export function generateProductId(): number {
  return Date.now();
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Discount Store ────────────────────────────────────────────────────────────

const DEFAULT_DISCOUNTS: DiscountCode[] = [
  { code: "DUAL10", discount: 10, type: "percent", usage: "Email capture", active: true },
  { code: "LAUNCH20", discount: 20, type: "percent", usage: "Launch campaign", active: false },
  { code: "ATHLETE15", discount: 15, type: "percent", usage: "Athlete referral", active: true },
];

export function getDiscounts(): DiscountCode[] {
  return load<DiscountCode[]>(KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
}

export async function saveDiscount(code: DiscountCode): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { db, doc, setDoc } = await getFirebase();
    const ref = doc(db, "discounts", code.code.toUpperCase());
    await setDoc(ref, sanitize(code));
  } catch (e) {
    console.error("Failed to save discount to Firestore", e);
  }
}

export async function deleteDiscount(code: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { db, doc, deleteDoc } = await getFirebase();
    const ref = doc(db, "discounts", code.toUpperCase());
    await deleteDoc(ref);
  } catch (e) {
    console.error("Failed to delete discount from Firestore", e);
  }
}

export function applyDiscount(code: string, price: number): { valid: boolean; finalPrice: number; discount: DiscountCode | null } {
  const discounts = getDiscounts();
  const found = discounts.find((d) => d.code.toUpperCase() === code.toUpperCase() && d.active);
  if (!found) return { valid: false, finalPrice: price, discount: null };
  const finalPrice = found.type === "percent"
    ? price * (1 - found.discount / 100)
    : Math.max(0, price - found.discount);
  return { valid: true, finalPrice, discount: found };
}

// ─── Offers Store ─────────────────────────────────────────────────────────────

const DEFAULT_OFFERS: Offer[] = [
  {
    id: "offer-1",
    title: "FREE SHIPPING on orders over $200",
    subtitle: "Use code DUAL10 for 10% off your first order",
    accentColor: "#9D4DFF",
    active: true,
    createdAt: Date.now(),
  },
];

export function getOffers(): Offer[] {
  return load<Offer[]>(KEYS.OFFERS, DEFAULT_OFFERS);
}

export function getActiveOffer(): Offer | null {
  const offers = getOffers();
  return offers.find((o) => o.active) || null;
}

export async function saveOffer(offer: Offer): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { db, doc, setDoc } = await getFirebase();
    const ref = doc(db, "offers", offer.id);
    await setDoc(ref, sanitize(offer));
  } catch (e) {
    console.error("Failed to save offer to Firestore", e);
  }
}

export async function deleteOffer(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { db, doc, deleteDoc } = await getFirebase();
    const ref = doc(db, "offers", id);
    await deleteDoc(ref);
  } catch (e) {
    console.error("Failed to delete offer from Firestore", e);
  }
}

// ─── Site Settings ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "DUALDEER",
  tagline: "Engineer Your Edge.",
  accentColor: "#9D4DFF",
  announcementText: "FREE SHIPPING on orders over $200 · Use code DUAL10",
  showAnnouncement: true,
};

export function getSettings(): SiteSettings {
  return load<SiteSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  save(KEYS.SETTINGS, settings);
  dispatchStoreEvent("settings");
  try {
    const { db, doc, setDoc } = await getFirebase();
    const { performanceImage: _omit, ...firestoreSafe } = settings;
    await setDoc(doc(db, "settings", "global"), sanitize(firestoreSafe), { merge: true });
  } catch (e) {
    console.error("[store] Failed to sync settings to Firestore:", e);
  }
}

export async function savePerformanceImage(imgbbUrl: string): Promise<void> {
  try {
    const { db, doc, setDoc } = await getFirebase();
    await setDoc(doc(db, "settings", "global"), { performanceImage: imgbbUrl }, { merge: true });
    const current = getSettings();
    save(KEYS.SETTINGS, { ...current, performanceImage: imgbbUrl });
    dispatchStoreEvent("settings");
  } catch (e) {
    console.error("[store] Failed to save performance image to Firestore:", e);
    throw e;
  }
}

export async function clearPerformanceImage(): Promise<void> {
  try {
    const { db, doc, setDoc } = await getFirebase();
    await setDoc(doc(db, "settings", "global"), { performanceImage: null }, { merge: true });
    const current = getSettings();
    const updated = { ...current };
    delete updated.performanceImage;
    save(KEYS.SETTINGS, updated);
    dispatchStoreEvent("settings");
  } catch (e) {
    console.error("[store] Failed to clear performance image:", e);
    throw e;
  }
}

export function onSettingsUpdate(callback: (data: Partial<SiteSettings>) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let unsubscribe: (() => void) | null = null;
  getFirebase().then(({ db, doc, onSnapshot }) => {
    unsubscribe = onSnapshot(
      doc(db, "settings", "global"),
      (snap) => {
        if (snap.exists()) callback(snap.data() as Partial<SiteSettings>);
      },
      (err) => console.error("[store] Settings snapshot error:", err)
    );
  });
  return () => { if (unsubscribe) unsubscribe(); };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getProducts().filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.longDescription.toLowerCase().includes(q) ||
      p.technology.some((t) => t.toLowerCase().includes(q)) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  });
}

// ─── Store Events (for reactivity without React context) ───────────────────────

export function dispatchStoreEvent(type: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dd_store_update", { detail: { type } }));
}

export function onStoreUpdate(callback: (type: string) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const ce = e as CustomEvent;
    callback(ce.detail?.type || "unknown");
  };
  window.addEventListener("dd_store_update", handler);
  return () => window.removeEventListener("dd_store_update", handler);
}

// ─── Order Store ───────────────────────────────────────────────────────────────

export function getOrders(): Order[] {
  return load<Order[]>(KEYS.ORDERS, []);
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  save(KEYS.ORDERS, orders);
  dispatchStoreEvent("orders");
}

export function updateOrderStatus(id: string, status: Order["status"]): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx >= 0) {
    orders[idx].status = status;
    save(KEYS.ORDERS, orders);
    dispatchStoreEvent("orders");
  }
}

export function markOrderRead(id: string): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx >= 0) {
    orders[idx].read = true;
    save(KEYS.ORDERS, orders);
    dispatchStoreEvent("orders");
  }
}

export function markAllOrdersRead(): void {
  const orders = getOrders().map((o) => ({ ...o, read: true }));
  save(KEYS.ORDERS, orders);
  dispatchStoreEvent("orders");
}

export function getUnreadOrderCount(): number {
  return getOrders().filter((o) => !o.read).length;
}

// ─── Browser Push Notifications ────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function notifyNewOrder(order: Order): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const total = `$${order.total.toFixed(2)}`;
  const items = order.items.map((i) => `${i.productName} ×${i.qty}`).join(", ");
  new Notification("🛍️ New Order — DualDeer", {
    body: `${order.customer.name} · ${total}\n${items}`,
    icon: "/favicon.ico",
    tag: order.id,
  });
}

// ─── FIRESTORE BACKGROUND SYNC ──────────────────────────────────────────────────
let isStoreInitialized = false;

export function initializeGlobalStoreSync() {
  if (typeof window === "undefined" || isStoreInitialized) return;
  isStoreInitialized = true;

  getFirebase()
    .then(({ db, collection, onSnapshot }) => {

      // Products
      onSnapshot(collection(db, "products"), (snapshot) => {
        const products = snapshot.docs.map((d) =>
          normalizeProduct(d.data() as Partial<Product>)
        );

        if (products.length > 0) {
          save(KEYS.PRODUCTS, products);
        }

        dispatchStoreEvent("products");
      });

      // Discounts
      onSnapshot(collection(db, "discounts"), (snapshot) => {
        const discounts = snapshot.docs.map((d) => d.data() as DiscountCode);

        if (discounts.length > 0) {
          save(KEYS.DISCOUNTS, discounts);
        }

        dispatchStoreEvent("discounts");
      });

      // Offers
      onSnapshot(collection(db, "offers"), (snapshot) => {
        const offers = snapshot.docs.map((d) => d.data() as Offer);

        if (offers.length > 0) {
          save(KEYS.OFFERS, offers);
        }

        dispatchStoreEvent("offers");
      });

    })
    .catch((err) => {
      console.error("[store] Firebase sync failed:", err);
    });
}

// Auto-run on client mount
export function startStoreSync() {
  if (typeof window === "undefined") return;
  initializeGlobalStoreSync();
}