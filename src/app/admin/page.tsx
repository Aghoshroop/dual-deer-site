"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Tag, Mail, BarChart2, Plus, Trash2, Edit3, Save,
  X, Check, ToggleLeft, ToggleRight, Upload, Image as ImageIcon,
  Settings, Megaphone, Eye, AlertTriangle, ShoppingBag
} from "lucide-react";
import {
  getProducts, saveProduct, deleteProduct, generateProductId, generateSlug,
  getDiscounts, saveDiscount, deleteDiscount,
  getOffers, saveOffer, deleteOffer,
  getSettings, saveSettings, savePerformanceImage, clearPerformanceImage,
  getActiveOffer, Offer,
  getOrders, updateOrderStatus, markAllOrdersRead, Order, onStoreUpdate
} from "@/lib/store";
import { Product, DiscountCode, SiteSettings } from "@/lib/products";
import { saveImage, getImage } from "@/lib/imageStore";
import { getRegisteredAccounts, StoredAccount } from "@/lib/AuthContext";

type Tab = "overview" | "orders" | "products" | "discounts" | "offers" | "emails" | "users" | "settings";

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Performance Image Uploader ───────────────────────────────────────────────
// Uploads to ImgBB CDN, then writes the public URL to Firestore.
// All devices subscribed via onSettingsUpdate() see the change instantly.

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "";

async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`ImgBB upload failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "ImgBB upload failed");
  // Use the display URL which is a direct CDN link served from ImgBB
  return json.data.display_url as string;
}

function PerformanceImageUploader({
  currentUrl,
  onUploaded,
  onCleared,
  showToast,
}: {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  onCleared: () => void;
  showToast: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const imgbbRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 32 * 1024 * 1024) { alert("Max file size for ImgBB is 32MB."); return; }
    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      await savePerformanceImage(url);  // → Firestore → all devices update instantly
      onUploaded(url);
      showToast("✓ Performance image live on all devices!");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check your ImgBB API key or try a smaller image.");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearPerformanceImage();
      onCleared();
      showToast("Performance image removed from all devices.");
    } catch {
      alert("Failed to remove image. Try again.");
    }
  };

  return (
    <div className="pt-2">
      <label className="text-xs text-gray-400 mb-1 block">Performance Architecture Section Image</label>
      <p className="text-[10px] text-gray-600 mb-3">
        Uploaded to ImgBB CDN — visible on <strong className="text-gray-500">all devices</strong> instantly.
        JPG/PNG/WebP, max 32MB.
      </p>

      {currentUrl ? (
        <div
          className="relative w-full h-44 rounded-xl overflow-hidden mb-2 group"
          style={{ border: "1px solid rgba(157,77,255,0.3)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt="Performance section" className="w-full h-full object-cover" />
          {/* Overlay: CDN badge + remove button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
          <div className="absolute top-2 left-2 text-[10px] font-mono px-2 py-1 rounded"
            style={{ background: "rgba(0,229,255,0.15)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.2)" }}>
            ● LIVE — ImgBB CDN
          </div>
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white
                       opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(239,68,68,0.85)" }}
          >
            <X className="w-3 h-3" /> Remove
          </button>
          <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono text-white/50 truncate">
            {currentUrl}
          </div>
        </div>
      ) : (
        <button
          onClick={() => imgbbRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all hover:border-purple-500 disabled:opacity-50 disabled:cursor-wait"
          style={{ border: "2px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-purple-400 font-mono">Uploading to ImgBB...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-500 mb-2" />
              <span className="text-xs text-gray-400">Click to upload performance image</span>
              <span className="text-[10px] text-gray-600 mt-1">ImgBB CDN · visible worldwide</span>
            </>
          )}
        </button>
      )}

      <input
        ref={imgbbRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: "rgba(10,5,20,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ color }} className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: `${color}20`, color }}>
      {text}
    </span>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  slug: "", name: "", price: 0, originalPrice: undefined, category: "Speed Suits",
  badge: "", rating: 4.5, reviews: 0, description: "", longDescription: "",
  accentColor: "#9D4DFF", sizes: ["XS", "S", "M", "L", "XL"], technology: [],
  inStock: true, images: [], colors: [{ name: "Void Black", hex: "#0a0512" }],
  features: [], reviewsList: [], related: [],
};

function ProductForm({ product, onSave, onCancel }: {
  product?: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const isNew = !product;
  const [form, setForm] = useState<Omit<Product, "id">>(
    product ? { ...product } : EMPTY_PRODUCT
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [techInput, setTechInput] = useState(form.technology.join(", "));
  const [sizesInput, setSizesInput] = useState(form.sizes.join(", "));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Preload existing images
    const loadImages = async () => {
      const urls = await Promise.all(
        form.images.map(async (imgId) => {
          const url = await getImage(imgId);
          return url || imgId; // fallback to the id (alt text) if not found
        })
      );
      setImageUrls(urls);
    };
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.images.join(",")]);


  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newIds = [...form.images];
    const newUrls = [...imageUrls];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { alert("Max file size is 5MB per image."); continue; }
      const id = await saveImage(file);
      const url = await getImage(id);
      newIds.push(id);
      newUrls.push(url || "");
    }
    setForm(f => ({ ...f, images: newIds }));
    setImageUrls(newUrls);
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    setImageUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!form.name.trim()) { alert("Product name is required."); return; }
    if (form.price <= 0) { alert("Price must be greater than 0."); return; }
    const slug = form.slug || generateSlug(form.name);
    const tech = techInput.split(",").map(s => s.trim()).filter(Boolean);
    const sizes = sizesInput.split(",").map(s => s.trim()).filter(Boolean);
    onSave({
      ...form,
      id: product?.id ?? generateProductId(),
      slug,
      technology: tech,
      sizes,
    });
  };

  const inp = "w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none";
  const inpStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div className="space-y-5 max-h-[78vh] overflow-y-auto pr-1 scrollbar-none">
      {/* Name + Slug */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Product Name *</label>
          <input className={inp} style={inpStyle} value={form.name}
            onChange={e => {
              setForm(f => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }));
            }} placeholder="DualDeer Speed Suit — Apex" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Slug (URL)</label>
          <input className={inp} style={inpStyle} value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="speed-suit-apex" />
        </div>
      </div>

      {/* Price + Original Price + Category + Badge */}
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Price ($) *</label>
          <input type="number" className={inp} style={inpStyle} value={form.price}
            onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Original ($)</label>
          <input type="number" className={inp} style={inpStyle} value={form.originalPrice || ""}
            onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value ? +e.target.value : undefined }))}
            placeholder="Optional" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
          <select className={inp} style={{ ...inpStyle, appearance: "none" }} value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {["Speed Suits", "Compression", "Training", "Accessories"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Badge</label>
          <input className={inp} style={inpStyle} value={form.badge || ""}
            onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
            placeholder="BEST SELLER / NEW / SALE" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Short Description</label>
        <input className={inp} style={inpStyle} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="One-line description for cards" />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Long Description</label>
        <textarea className={`${inp} h-20 resize-none`} style={inpStyle} value={form.longDescription}
          onChange={e => setForm(f => ({ ...f, longDescription: e.target.value }))}
          placeholder="Full product story, materials, engineering..." />
      </div>

      {/* Sizes + Technology */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Sizes (comma-separated)</label>
          <input className={inp} style={inpStyle} value={sizesInput}
            onChange={e => setSizesInput(e.target.value)} placeholder="XS, S, M, L, XL, XXL" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Technology Tags (comma-separated)</label>
          <input className={inp} style={inpStyle} value={techInput}
            onChange={e => setTechInput(e.target.value)} placeholder="Carbon Fiber, Breathable Mesh..." />
        </div>
      </div>

      {/* Accent + Stock */}
      <div className="grid grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Accent Color</label>
          <div className="flex items-center gap-2">
            <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              value={form.accentColor}
              onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))} />
            <input className={`${inp} flex-1`} style={inpStyle} value={form.accentColor}
              onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Rating</label>
          <input type="number" step="0.1" min="0" max="5" className={inp} style={inpStyle}
            value={form.rating}
            onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400">In Stock</label>
          <button onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))}
            className="transition-colors">
            {form.inStock
              ? <ToggleRight className="w-8 h-8 text-green-400" />
              : <ToggleLeft className="w-8 h-8 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="text-xs text-gray-400 mb-2 block">Product Images</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {url.startsWith("data:") || url.startsWith("http") || url.startsWith("/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <button onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}

          <button onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:border-purple-500 cursor-pointer"
            style={{ border: "2px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}
            disabled={uploading}>
            {uploading ? (
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-[10px] text-gray-600">Upload</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleImageUpload(e.target.files)} />
        </div>
        <p className="text-[10px] text-gray-600">Upload JPG/PNG/WebP, max 5MB each. Stored locally, free.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <button onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.01]"
          style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 20px rgba(106,0,255,0.3)" }}>
          <Save className="w-4 h-4" />
          {isNew ? "Create Product" : "Save Changes"}
        </button>
        <button onClick={onCancel}
          className="px-5 py-3 rounded-xl text-sm text-gray-400 transition-colors hover:text-white"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl p-6 relative"
        style={{ background: "rgba(10,5,20,0.98)", border: "1px solid rgba(157,77,255,0.2)", maxHeight: "90vh", overflow: "hidden" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [users, setUsers] = useState<StoredAccount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string | number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    setProducts(getProducts());
    setDiscounts(getDiscounts());
    setOffers(getOffers());
    setSettings(getSettings());
    const o = getOrders();
    setOrders(o);
    setUnreadOrders(o.filter((x) => !x.read).length);
    setUsers(getRegisteredAccounts());
    try { setEmails(JSON.parse(localStorage.getItem("dualdeer_captured_emails") || "[]")); } catch { /* ignore */ }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Live-update when store changes (e.g. from Firestore sync or checkout)
  useEffect(() => {
    return onStoreUpdate((type) => {
      if (type === "orders") {
        const o = getOrders();
        setOrders(o);
        setUnreadOrders(o.filter((x) => !x.read).length);
      } else if (type === "products") {
        setProducts(getProducts());
      } else if (type === "discounts") {
        setDiscounts(getDiscounts());
      } else if (type === "offers") {
        setOffers(getOffers());
      } else if (type === "settings") {
        setSettings(getSettings());
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ─── Product Actions ──────────────────────────────────────────────────────

  const handleSaveProduct = (product: Product) => {
    saveProduct(product);
    setShowProductForm(false);
    setEditingProduct(undefined);
    showToast("Product saved! Syncing to cloud...");
  };

  const handleDeleteProduct = (id: number) => {
    deleteProduct(id);
    setConfirmDelete(null);
    showToast("Product deleted.");
  };

  // ─── Discount Actions ─────────────────────────────────────────────────────

  const [discountForm, setDiscountForm] = useState<DiscountCode>({ code: "", discount: 10, type: "percent", usage: "", active: true });

  const handleSaveDiscount = () => {
    if (!discountForm.code.trim()) { alert("Code is required."); return; }
    saveDiscount({ ...discountForm, code: discountForm.code.toUpperCase() });
    setShowDiscountForm(false);
    setEditingDiscount(null);
    showToast("Discount code saved! Syncing to cloud...");
  };

  // ─── Offer Actions ─────────────────────────────────────────────────────────

  const [offerForm, setOfferForm] = useState<Offer>({
    id: "", title: "", subtitle: "", accentColor: "#9D4DFF", active: true, createdAt: Date.now()
  });

  const handleSaveOffer = () => {
    if (!offerForm.title.trim()) { alert("Title is required."); return; }
    const offer: Offer = {
      ...offerForm,
      id: offerForm.id || `offer-${Date.now()}`,
      createdAt: offerForm.createdAt || Date.now(),
    };
    saveOffer(offer);
    setShowOfferForm(false);
    setEditingOffer(null);
    showToast("Offer saved! Syncing to cloud...");
  };

  // ─── Settings ─────────────────────────────────────────────────────────────

  const handleSaveSettings = () => {
    if (settings) { saveSettings(settings); showToast("Settings saved!"); }
  };

  // ─── Tabs Config ──────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" />, badge: unreadOrders },
    { id: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { id: "discounts", label: "Discounts", icon: <Tag className="w-4 h-4" /> },
    { id: "offers", label: "Offers", icon: <Megaphone className="w-4 h-4" /> },
    { id: "emails", label: "Emails", icon: <Mail className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Package className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const inp = "w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none";
  const inpStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.25)", color: "#00E5FF" }}>
            <Check className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "rgba(157,77,255,0.1)", background: "rgba(10,5,20,0.98)" }}>
        <div>
          <span className="text-lg font-bold">DUALDEER</span>
          <span className="text-gradient">.</span>
          <span className="ml-2 text-xs font-mono text-gray-500 tracking-widest">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
            <Eye className="w-3 h-3" /> View Site
          </a>
          <div className="text-xs font-mono px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,229,255,0.08)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.2)" }}>
            ● LIVE
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-52 min-h-[calc(100vh-60px)] p-4 border-r flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(5,5,10,0.9)" }}>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "orders" && tab.badge) {
                  markAllOrdersRead();
                  setOrders(getOrders());
                  setUnreadOrders(0);
                }
              }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all relative"
                style={{
                  background: activeTab === tab.id ? "rgba(157,77,255,0.12)" : "transparent",
                  color: activeTab === tab.id ? "#C084FF" : "#6b7280",
                  border: activeTab === tab.id ? "1px solid rgba(157,77,255,0.2)" : "1px solid transparent",
                }}>
                {tab.icon}
                <span className="flex-1">{tab.label}</span>
                {tab.badge != null && tab.badge > 0 && (
                  <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0"
                    style={{ background: "#9D4DFF", color: "#fff" }}>
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 min-w-0">

          {/* ── OVERVIEW ─────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-gray-500 text-sm mb-8">Real-time store status from your browser store.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Products" value={products.length.toString()} color="#9D4DFF" icon={<Package className="w-5 h-5" />} />
                <StatCard label="Active Discounts" value={discounts.filter(d => d.active).length.toString()} color="#C084FF" icon={<Tag className="w-5 h-5" />} />
                <StatCard label="Captured Emails" value={emails.length.toString()} color="#00E5FF" icon={<Mail className="w-5 h-5" />} />
                <StatCard label="Catalog Value" value={`$${products.reduce((s, p) => s + p.price, 0).toLocaleString()}`} color="#6A00FF" icon={<BarChart2 className="w-5 h-5" />} />
              </div>

              {/* Active Offer preview */}
              {getActiveOffer() && (
                <div className="p-5 rounded-2xl mb-4" style={{ background: "rgba(10,5,20,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-xs font-mono tracking-widest text-gray-500 mb-2">ACTIVE OFFER BANNER</p>
                  <p className="text-white font-semibold">{getActiveOffer()!.title}</p>
                  {getActiveOffer()!.subtitle && <p className="text-sm text-gray-400 mt-0.5">{getActiveOffer()!.subtitle}</p>}
                </div>
              )}

              <div className="p-5 rounded-2xl" style={{ background: "rgba(10,5,20,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-xs font-mono tracking-widest text-gray-500 mb-3">SYSTEM STATUS</p>
                <div className="space-y-2 text-sm text-gray-400">
                  {["Product Store: localStorage ✓", "Images: IndexedDB ✓", "Auth: PIN-protected ✓", "Email capture: active ✓", "SEO: sitemap + robots + JSON-LD ✓"].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ORDERS ────────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Orders</h1>
                  <p className="text-gray-500 text-sm">{orders.length} total · {unreadOrders} new</p>
                </div>
                {unreadOrders > 0 && (
                  <button
                    onClick={() => { markAllOrdersRead(); setOrders(getOrders()); setUnreadOrders(0); }}
                    className="text-xs px-4 py-2 rounded-xl font-bold"
                    style={{ background: "rgba(157,77,255,0.12)", color: "#C084FF", border: "1px solid rgba(157,77,255,0.25)" }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(157,77,255,0.3)" }} />
                  <p className="text-gray-500">No orders yet. When customers place orders, they appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl relative"
                      style={{
                        background: "rgba(10,5,20,0.8)",
                        border: order.read ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(157,77,255,0.35)",
                        boxShadow: order.read ? "none" : "0 0 20px rgba(157,77,255,0.08)",
                      }}
                    >
                      {/* Unread dot */}
                      {!order.read && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-400" />
                      )}

                      <div className="flex flex-wrap items-start gap-4 mb-4">
                        {/* Order ID + date */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold font-mono text-sm">{order.id}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(order.placedAt).toLocaleString()}
                          </p>
                        </div>
                        {/* Status badge */}
                        <span
                          className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                          style={{
                            background: order.status === "new" ? "rgba(157,77,255,0.15)" :
                              order.status === "processing" ? "rgba(234,179,8,0.15)" :
                                order.status === "shipped" ? "rgba(59,130,246,0.15)" : "rgba(34,197,94,0.15)",
                            color: order.status === "new" ? "#C084FF" :
                              order.status === "processing" ? "#EAB308" :
                                order.status === "shipped" ? "#60A5FA" : "#4ADE80",
                          }}
                        >
                          {order.status}
                        </span>
                        {/* Total */}
                        <p className="text-lg font-black" style={{ color: "#C084FF" }}>${order.total.toFixed(2)}</p>
                      </div>

                      {/* Customer info */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-xs">
                        <div>
                          <p className="text-gray-600 mb-0.5">Customer</p>
                          <p className="text-white font-semibold">{order.customer.name}</p>
                          <p className="text-gray-500">{order.customer.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-0.5">Ship to</p>
                          <p className="text-gray-300">{order.customer.address}</p>
                          <p className="text-gray-300">{order.customer.city}, {order.customer.zip}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-0.5">Delivery</p>
                          <p className="text-gray-300 capitalize">{order.deliveryMethod}</p>
                          <p className="text-gray-300 capitalize">{order.paymentMethod}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-gray-400">{item.productName} — Size {item.size} ×{item.qty}</span>
                            <span className="text-gray-300">${(item.unitPrice * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status update */}
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">Update Status:</p>
                        {(["new", "processing", "shipped", "delivered"] as Order["status"][]).map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              updateOrderStatus(order.id, s);
                              setOrders(getOrders());
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-full capitalize font-mono transition-all"
                            style={{
                              background: order.status === s ? "rgba(157,77,255,0.25)" : "rgba(255,255,255,0.04)",
                              color: order.status === s ? "#C084FF" : "#6b7280",
                              border: order.status === s ? "1px solid rgba(157,77,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PRODUCTS ──────────────────────────────────────────── */}
          {activeTab === "products" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Products</h1>
                  <p className="text-gray-500 text-sm">{products.length} products in catalog</p>
                </div>
                <button onClick={() => { setEditingProduct(undefined); setShowProductForm(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 16px rgba(106,0,255,0.3)" }}>
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="space-y-2">
                {products.map((product, index) => (
                  <ProductRow key={`${product.id}-${index}`} product={product}
                    onEdit={() => { setEditingProduct(product); setShowProductForm(true); }}
                    onDelete={() => setConfirmDelete({ type: "product", id: product.id })} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── DISCOUNTS ─────────────────────────────────────────── */}
          {activeTab === "discounts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Discount Codes</h1>
                  <p className="text-gray-500 text-sm">{discounts.filter(d => d.active).length} active codes</p>
                </div>
                <button onClick={() => { setDiscountForm({ code: "", discount: 10, type: "percent", usage: "", active: true }); setShowDiscountForm(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 16px rgba(106,0,255,0.3)" }}>
                  <Plus className="w-4 h-4" /> Add Code
                </button>
              </div>

              <div className="space-y-3">
                {discounts.map((code) => (
                  <div key={code.code} className="flex items-center gap-4 p-5 rounded-xl"
                    style={{ background: "rgba(10,5,20,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold font-mono tracking-widest">{code.code}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{code.usage}</p>
                    </div>
                    <span className="font-bold" style={{ color: "#C084FF" }}>
                      {code.type === "percent" ? `${code.discount}%` : `$${code.discount}`} OFF
                    </span>
                    <button onClick={() => { saveDiscount({ ...code, active: !code.active }); }}
                      className="transition-colors">
                      {code.active
                        ? <ToggleRight className="w-7 h-7 text-green-400" />
                        : <ToggleLeft className="w-7 h-7 text-gray-600" />}
                    </button>
                    <button onClick={() => { setDiscountForm(code); setEditingDiscount(code); setShowDiscountForm(true); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDelete({ type: "discount", id: code.code })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                      style={{ background: "rgba(239,68,68,0.08)" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── OFFERS ────────────────────────────────────────────── */}
          {activeTab === "offers" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Promotional Offers</h1>
                  <p className="text-gray-500 text-sm">Create announcement banners shown at the top of the site</p>
                </div>
                <button onClick={() => {
                  setOfferForm({ id: "", title: "", subtitle: "", accentColor: "#9D4DFF", active: true, createdAt: Date.now() });
                  setEditingOffer(null); setShowOfferForm(true);
                }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 16px rgba(106,0,255,0.3)" }}>
                  <Plus className="w-4 h-4" /> Add Offer
                </button>
              </div>

              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex items-start gap-4 p-5 rounded-xl"
                    style={{ background: "rgba(10,5,20,0.8)", border: `1px solid ${offer.accentColor}20` }}>
                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: offer.accentColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{offer.title}</p>
                      {offer.subtitle && <p className="text-sm text-gray-400 mt-0.5">{offer.subtitle}</p>}
                    </div>
                    <button onClick={() => { saveOffer({ ...offer, active: !offer.active }); }}
                      className="transition-colors flex-shrink-0">
                      {offer.active
                        ? <ToggleRight className="w-7 h-7 text-green-400" />
                        : <ToggleLeft className="w-7 h-7 text-gray-600" />}
                    </button>
                    <button onClick={() => { setOfferForm(offer); setEditingOffer(offer); setShowOfferForm(true); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDelete({ type: "offer", id: offer.id })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.08)" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {offers.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No offers yet. Create your first promotion!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── EMAILS ────────────────────────────────────────────── */}
          {activeTab === "emails" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Captured Emails</h1>
                  <p className="text-gray-500 text-sm">{emails.length} emails from discount popup + newsletter</p>
                </div>
                {emails.length > 0 && (
                  <button onClick={() => {
                    navigator.clipboard.writeText(emails.join("\n"));
                    showToast("Emails copied to clipboard!");
                  }}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: "rgba(0,229,255,0.08)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.2)" }}>
                    Copy All
                  </button>
                )}
              </div>
              {emails.length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No emails captured yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emails.map((email, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl"
                      style={{ background: "rgba(10,5,20,0.8)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "#9D4DFF" }} />
                      <span className="text-sm text-white">{email}</span>
                      <span className="ml-auto text-xs font-mono text-gray-600">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── USERS ────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Registered Users</h1>
                  <p className="text-gray-500 text-sm">{users.length} registered accounts</p>
                </div>
              </div>
              {users.length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No users registered yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 rounded-xl"
                      style={{ background: "rgba(10,5,20,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                        style={{ background: "rgba(157,77,255,0.15)", color: "#C084FF" }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500 font-mono tracking-wider">JOINED</p>
                        <p className="text-sm text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── SETTINGS ──────────────────────────────────────────── */}
          {activeTab === "settings" && settings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-2xl font-bold mb-2">Site Settings</h1>
              <p className="text-gray-500 text-sm mb-8">Configure global site preferences</p>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Announcement Bar Text</label>
                  <input className={inp} style={inpStyle} value={settings.announcementText}
                    onChange={e => setSettings(s => s ? { ...s, announcementText: e.target.value } : s)}
                    placeholder="FREE SHIPPING on orders over $200..." />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-400">Show Announcement Bar</label>
                  <button onClick={() => setSettings(s => s ? { ...s, showAnnouncement: !s.showAnnouncement } : s)}>
                    {settings.showAnnouncement
                      ? <ToggleRight className="w-8 h-8 text-green-400" />
                      : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Site Tagline</label>
                  <input className={inp} style={inpStyle} value={settings.tagline}
                    onChange={e => setSettings(s => s ? { ...s, tagline: e.target.value } : s)} />
                </div>

                {/* ── Performance Architecture Section Image ── */}
                <PerformanceImageUploader
                  currentUrl={settings.performanceImage}
                  onUploaded={(url) => setSettings(s => s ? { ...s, performanceImage: url } : s)}
                  onCleared={() => setSettings(s => s ? { ...s, performanceImage: undefined } : s)}
                  showToast={showToast}
                />

                <button onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 16px rgba(106,0,255,0.3)" }}>
                  <Save className="w-4 h-4" /> Save Settings
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProductForm && (
          <Modal title={editingProduct ? "Edit Product" : "Add New Product"}
            onClose={() => { setShowProductForm(false); setEditingProduct(undefined); }}>
            <ProductForm product={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => { setShowProductForm(false); setEditingProduct(undefined); }} />
          </Modal>
        )}

        {showDiscountForm && (
          <Modal title={editingDiscount ? "Edit Discount Code" : "Add Discount Code"}
            onClose={() => { setShowDiscountForm(false); setEditingDiscount(null); }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Code *</label>
                  <input className={inp} style={inpStyle} value={discountForm.code}
                    onChange={e => setDiscountForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="DUAL10" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Usage Description</label>
                  <input className={inp} style={inpStyle} value={discountForm.usage}
                    onChange={e => setDiscountForm(f => ({ ...f, usage: e.target.value }))}
                    placeholder="Email capture, athlete referral..." />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Discount Value</label>
                  <input type="number" className={inp} style={inpStyle} value={discountForm.discount}
                    onChange={e => setDiscountForm(f => ({ ...f, discount: +e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Type</label>
                  <select className={inp} style={{ ...inpStyle, appearance: "none" }} value={discountForm.type}
                    onChange={e => setDiscountForm(f => ({ ...f, type: e.target.value as "percent" | "fixed" }))}>
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400">Active</label>
                    <button onClick={() => setDiscountForm(f => ({ ...f, active: !f.active }))}>
                      {discountForm.active
                        ? <ToggleRight className="w-7 h-7 text-green-400" />
                        : <ToggleLeft className="w-7 h-7 text-gray-600" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button onClick={handleSaveDiscount}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)" }}>
                  <Save className="w-4 h-4" /> Save Code
                </button>
                <button onClick={() => { setShowDiscountForm(false); setEditingDiscount(null); }}
                  className="px-5 py-3 rounded-xl text-sm text-gray-400"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showOfferForm && (
          <Modal title={editingOffer ? "Edit Offer" : "Create Offer Banner"}
            onClose={() => { setShowOfferForm(false); setEditingOffer(null); }}>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Banner Title *</label>
                <input className={inp} style={inpStyle} value={offerForm.title}
                  onChange={e => setOfferForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="FREE SHIPPING on orders over $200" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Subtitle</label>
                <input className={inp} style={inpStyle} value={offerForm.subtitle}
                  onChange={e => setOfferForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Use code DUAL10 for 10% off" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1.5 block">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                      value={offerForm.accentColor}
                      onChange={e => setOfferForm(f => ({ ...f, accentColor: e.target.value }))} />
                    <input className={`${inp} flex-1`} style={inpStyle} value={offerForm.accentColor}
                      onChange={e => setOfferForm(f => ({ ...f, accentColor: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <label className="text-xs text-gray-400">Active</label>
                  <button onClick={() => setOfferForm(f => ({ ...f, active: !f.active }))}>
                    {offerForm.active
                      ? <ToggleRight className="w-7 h-7 text-green-400" />
                      : <ToggleLeft className="w-7 h-7 text-gray-600" />}
                  </button>
                </div>
              </div>
              {/* Preview */}
              {offerForm.title && (
                <div className="p-3 rounded-xl text-center text-sm"
                  style={{ background: `${offerForm.accentColor}12`, border: `1px solid ${offerForm.accentColor}25` }}>
                  <span style={{ color: offerForm.accentColor }}>{offerForm.title}</span>
                  {offerForm.subtitle && <span className="text-gray-400 ml-2">· {offerForm.subtitle}</span>}
                </div>
              )}
              <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button onClick={handleSaveOffer}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)" }}>
                  <Save className="w-4 h-4" /> Save Offer
                </button>
                <button onClick={() => { setShowOfferForm(false); setEditingOffer(null); }}
                  className="px-5 py-3 rounded-xl text-sm text-gray-400"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Confirm Delete */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "rgba(10,5,20,0.98)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-white text-center font-semibold mb-1">Confirm Delete</p>
              <p className="text-gray-400 text-sm text-center mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-400"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  Cancel
                </button>
                <button onClick={() => {
                  if (confirmDelete.type === "product") handleDeleteProduct(confirmDelete.id as number);
                  else if (confirmDelete.type === "discount") { deleteDiscount(confirmDelete.id as string); setConfirmDelete(null); showToast("Discount deleted."); }
                  else if (confirmDelete.type === "offer") { deleteOffer(confirmDelete.id as string); setConfirmDelete(null); showToast("Offer deleted."); }
                }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Product Row Component ─────────────────────────────────────────────────────

function ProductRow({ product, onEdit, onDelete }: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    const firstImg = product.images?.[0];
    if (firstImg) {
      getImage(firstImg).then(url => setImgUrl(url));
    }
  }, [product]);

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:border-purple-500/20"
      style={{ background: "rgba(10,5,20,0.8)", border: "1px solid rgba(255,255,255,0.04)" }}>
      {/* Image thumbnail */}
      <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: `${product.accentColor}15`, border: `1px solid ${product.accentColor}25` }}>
        {imgUrl && (imgUrl.startsWith("data:") || imgUrl.startsWith("http") || imgUrl.startsWith("/")) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-mono" style={{ color: product.accentColor }}>{product.id}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category} · /{product.slug}</p>
      </div>

      <div className="flex items-center gap-3 text-sm flex-shrink-0">
        <span style={{ color: product.accentColor }} className="font-bold">${product.price}</span>
        {product.originalPrice && <span className="text-gray-600 text-xs line-through">${product.originalPrice}</span>}
        {product.badge && <Badge text={product.badge} color={product.accentColor} />}
        <span className={`text-xs px-2 py-0.5 rounded-full ${product.inStock ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <Edit3 className="w-4 h-4" />
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
          style={{ background: "rgba(239,68,68,0.08)" }}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
