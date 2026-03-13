/**
 * DualDeer Dynamic Store
 * All data stored in localStorage — zero cost, no backend needed.
 * Automatically seeds from DEFAULT_PRODUCTS on first load.
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

// ─── Product Store ─────────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  const stored = load<Product[] | null>(KEYS.PRODUCTS, null);
  if (!stored) {
    // Seed with defaults on first ever load
    save(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
  return stored;
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

export function saveProduct(product: Product): void {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.push(product);
  }
  save(KEYS.PRODUCTS, products);
  // Dispatch event so components can react
  dispatchStoreEvent("products");
}

export function deleteProduct(id: number): void {
  const products = getProducts().filter((p) => p.id !== id);
  save(KEYS.PRODUCTS, products);
  dispatchStoreEvent("products");
}

export function generateProductId(): number {
  const products = getProducts();
  return products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
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

export function saveDiscount(code: DiscountCode): void {
  const discounts = getDiscounts();
  const idx = discounts.findIndex((d) => d.code === code.code);
  if (idx >= 0) discounts[idx] = code;
  else discounts.push(code);
  save(KEYS.DISCOUNTS, discounts);
  dispatchStoreEvent("discounts");
}

export function deleteDiscount(code: string): void {
  const discounts = getDiscounts().filter((d) => d.code !== code);
  save(KEYS.DISCOUNTS, discounts);
  dispatchStoreEvent("discounts");
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

export function saveOffer(offer: Offer): void {
  const offers = getOffers();
  const idx = offers.findIndex((o) => o.id === offer.id);
  if (idx >= 0) offers[idx] = offer;
  else offers.push(offer);
  save(KEYS.OFFERS, offers);
  dispatchStoreEvent("offers");
}

export function deleteOffer(id: string): void {
  const offers = getOffers().filter((o) => o.id !== id);
  save(KEYS.OFFERS, offers);
  dispatchStoreEvent("offers");
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

export function saveSettings(settings: SiteSettings): void {
  save(KEYS.SETTINGS, settings);
  dispatchStoreEvent("settings");
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
  orders.unshift(order); // newest first
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

