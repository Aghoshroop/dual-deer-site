"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ShoppingBag, Sparkles, ChevronDown, RotateCcw, Zap } from "lucide-react";
import { getProducts } from "@/lib/store";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/CartContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  products?: Product[];
  comparison?: { a: Product; b: Product };
  quickReplies?: string[];
  timestamp: number;
  streaming?: boolean;
}

interface ConversationContext {
  userName?: string;
  mentionedProducts: Product[];
  lastIntent: string;
  stage: "new" | "browsing" | "comparing" | "checkout";
  preferredCategory?: string;
  budgetRange?: { min?: number; max?: number };
  preferredSize?: string;
  sessionStart: number;
}

// ─── AI Engine ────────────────────────────────────────────────────────────────

const INTENTS: Record<string, string[]> = {
  sprint:       ["sprint", "speed", "fast", "track", "100m", "200m", "400m", "run", "dash", "quick", "velocity"],
  marathon:     ["marathon", "endurance", "long distance", "5k", "10k", "half marathon", "ultramarathon", "ironman"],
  recovery:     ["recover", "recovery", "sore", "rest", "sleep", "doms", "after workout", "post workout", "regenerate"],
  compression:  ["compress", "compression", "tight", "support", "muscle", "vibration", "circulation"],
  fullbody:     ["full body", "full suit", "head to toe", "complete outfit", "everything", "full kit"],
  upper:        ["upper", "top", "shirt", "chest", "shoulder", "lat", "back", "core"],
  lower:        ["lower", "leg", "quad", "hamstring", "calf", "tights", "knee", "ankle", "glutes"],
  training:     ["gym", "train", "hiit", "lift", "workout", "crossfit", "strength", "powerlifting", "wod"],
  triathlon:    ["triathlon", "swim", "bike", "cycle", "cycle run", "aquathlon"],
  youth:        ["youth", "junior", "teen", "child", "kid", "young", "under 18"],
  gift:         ["gift", "present", "buy for", "someone else", "birthday", "christmas", "anniversary"],
  weather:      ["hot", "cold", "summer", "winter", "heat", "sweat", "rain", "moisture", "breathable", "warm"],
  injury:       ["injury", "injured", "hurt", "pain", "support", "protect", "rehab", "recover from"],
  compare:      ["compare", "vs", "versus", "difference", "which is better", "between", "or"],
  budget:       ["cheap", "budget", "affordable", "under", "less than", "save", "discount", "deal", "price"],
  premium:      ["best", "premium", "elite", "top tier", "highest", "luxury", "professional", "flagship"],
  size:         ["size", "sizing", "fit", "measurement", "xs", "xsmall", "small", "medium", "large", "xl", "xxl", "tall", "petite", "slim"],
  fabric:       ["fabric", "material", "carbon", "fiber", "technology", "how is it made", "weave", "polyester", "spandex"],
  shipping:     ["ship", "shipping", "delivery", "arrive", "when", "how long", "track", "customs"],
  return:       ["return", "refund", "exchange", "money back", "policy", "cancel"],
  sale:         ["sale", "discount", "coupon", "promo", "code", "offer", "deal", "cheap"],
  greeting:     ["hi", "hello", "hey", "howdy", "good morning", "good afternoon", "start", "help", "what can you do"],
  cart:         ["cart", "add", "buy now", "checkout", "order", "purchase"],
  thanks:       ["thanks", "thank you", "cheers", "great", "perfect", "awesome", "ok got it"],
};

type Intent = keyof typeof INTENTS;

function detectIntents(message: string): Intent[] {
  const lower = message.toLowerCase();
  return (Object.keys(INTENTS) as Intent[]).filter(intent =>
    INTENTS[intent].some(kw => lower.includes(kw))
  );
}

function extractBudgetRange(message: string): { min?: number; max?: number } | null {
  const lower = message.toLowerCase();
  // "between $100 and $200"
  const rangeMatch = message.match(/\$?(\d+)\s*(?:to|and|-)\s*\$?(\d+)/);
  if (rangeMatch) return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
  // "under $150"
  const underMatch = message.match(/under\s+\$?(\d+)/i);
  if (underMatch) return { max: parseInt(underMatch[1]) };
  // "above $200"
  const aboveMatch = message.match(/(?:above|over|more than)\s+\$?(\d+)/i);
  if (aboveMatch) return { min: parseInt(aboveMatch[1]) };
  // bare "$100"
  const bareMatch = message.match(/\$(\d+)/);
  if (bareMatch) return { max: parseInt(bareMatch[1]) };
  return null;
}

function extractSize(message: string): string | null {
  const lower = message.toLowerCase();
  const sizeMap: Record<string, string> = {
    xs: "XS", xsmall: "XS", "x-small": "XS",
    s: "S", sm: "S", small: "S",
    m: "M", md: "M", medium: "M",
    l: "L", lg: "L", large: "L",
    xl: "XL",
    xxl: "XXL", "2xl": "XXL", "2x": "XXL",
  };
  for (const [key, val] of Object.entries(sizeMap)) {
    if (lower.includes(` ${key} `) || lower.includes(` ${key}`) || lower.endsWith(key) || lower.startsWith(key)) {
      return val;
    }
  }
  return null;
}

function scoreProduct(product: Product, intents: Intent[], budget: { min?: number; max?: number } | null): number {
  let score = 0;
  const text = [product.name, product.description, ...product.technology].join(" ").toLowerCase();

  const catScores: Record<string, Intent[]> = {
    "Speed Suits": ["sprint", "fullbody", "triathlon"],
    "Compression": ["compression", "upper", "lower", "recovery", "injury"],
    "Training": ["training", "gym", "hiit"],
    "Recovery": ["recovery"],
    "Accessories": ["upper"],
  };

  for (const [cat, catIntents] of Object.entries(catScores)) {
    if (product.category === cat && catIntents.some(i => intents.includes(i))) score += 10;
  }

  if (intents.includes("premium")) { score += product.rating * 2.5; score += product.price > 200 ? 6 : 0; }
  if (intents.includes("weather") && text.includes("breathable")) score += 5;
  if (intents.includes("marathon") && text.includes("endurance")) score += 8;
  if (intents.includes("injury") && text.includes("support")) score += 7;

  // Budget filter
  if (budget?.max && product.price > budget.max) score -= 15;
  if (budget?.max && product.price <= budget.max) score += 6;
  if (budget?.min && product.price >= budget.min) score += 3;

  // Base quality signals
  score += product.rating * 1.8;
  score += product.badge ? 4 : 0;
  score += product.inStock ? 2 : -5;

  // Boost by keyword match density
  const keywordHits = intents.flatMap(i => INTENTS[i]).filter(kw => text.includes(kw)).length;
  score += keywordHits * 1.5;

  return score;
}

function buildComparisonTable(a: Product, b: Product): string {
  return `Here's a quick comparison:\n\n**${a.name}** vs **${b.name}**\n\n| Feature | ${a.name} | ${b.name} |\n|---|---|---|\n| Price | $${a.price} | $${b.price} |\n| Category | ${a.category} | ${b.category} |\n| Rating | ⭐ ${a.rating} | ⭐ ${b.rating} |\n| Stock | ${a.inStock ? "✅ In Stock" : "❌ Out"} | ${b.inStock ? "✅ In Stock" : "❌ Out"} |\n\nMy recommendation: **${a.rating >= b.rating ? a.name : b.name}** wins on rating. Want me to add one to your cart?`;
}

function generateReply(
  message: string,
  intents: Intent[],
  products: Product[],
  ctx: ConversationContext
): { text: string; products?: Product[]; comparison?: { a: Product; b: Product }; quickReplies: string[] } {
  const name = ctx.userName ? `, ${ctx.userName.split(" ")[0]}` : "";
  const budget = ctx.budgetRange || extractBudgetRange(message);

  if (intents.includes("greeting") && ctx.stage === "new") {
    return {
      text: `Hey${name}! 🦌 I'm Deer, your DualDeer performance advisor. I know every product in our lineup — tell me what you're training for and I'll find your perfect match. What brings you here today?`,
      quickReplies: ["Speed suits 🚀", "Recovery gear 💜", "Best sellers ⭐", "Something under $150 💰"],
    };
  }

  if (intents.includes("thanks")) {
    return {
      text: `Anytime${name}! 🦌 You're going to crush it. Anything else I can help you find?`,
      quickReplies: ["Show me more products", "Recovery gear", "Browse all"],
    };
  }

  if (intents.includes("fabric")) {
    return {
      text: `Great question! Our suits use a 64-layer **carbon micro-fiber weave** — each layer is just 0.02mm thick. The outer shell is DuPont™ aerodynamic nylon with a coefficient of drag of just 0.04 Cd. The inner layer uses moisture-wicking graphene-blend fabric that moves sweat away 3× faster than standard polyester. Want to see which products use the latest fiber tech?`,
      quickReplies: ["Show carbon fiber suits", "Speed suits", "Compression tops"],
    };
  }

  if (intents.includes("size")) {
    const size = extractSize(message);
    return {
      text: `${size ? `Sizing for **${size}**: ` : ""}Our sizing runs true to athletic build — if you're between sizes, go **up** for comfort or stay **true** for maximum compression effect. All Speed Suits come in XS–XXL. Compression gear goes XS–XXL+. For reference:\n\n• **XS** → 5'2\"–5'5\" / 100–130 lbs\n• **S** → 5'4\"–5'7\" / 120–150 lbs\n• **M** → 5'7\"–6'0\" / 150–185 lbs\n• **L** → 6'0\"–6'3\" / 180–220 lbs\n• **XL/XXL** → 6'2\"+ / 200+ lbs\n\nWant me to recommend a product for your size?`,
      quickReplies: ["Show XS/S products", "Show M/L products", "Show XL/XXL products"],
    };
  }

  if (intents.includes("shipping")) {
    return {
      text: `🚚 Shipping details:\n\n• **Free shipping** on orders over $200\n• Standard: 3–5 business days\n• Express 1–2 day: available at checkout (+$15)\n• International: 7–14 days\n\nOrders placed before 2pm ship same day! Is there a specific product you're ready to order?`,
      quickReplies: ["Browse products", "Speed suits", "View cart"],
    };
  }

  if (intents.includes("return")) {
    return {
      text: `No worries — we have a **30-day hassle-free return policy**. If it doesn't fit perfectly or you're not 100% satisfied, just send it back. Free return shipping on all orders. Exchanges take 2–3 business days. Want to find the perfect product so you won't need to return it? 😄`,
      quickReplies: ["Help me find the right size", "Browse products", "Speed suits"],
    };
  }

  if (intents.includes("sale") || intents.includes("budget")) {
    const budgetMax = budget?.max;
    const affordable = products
      .filter(p => p.inStock && (!budgetMax || p.price <= budgetMax))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
    if (affordable.length > 0) {
      return {
        text: `Here are our best value picks${budgetMax ? ` under $${budgetMax}` : ""} 🏷️ — high performance, smart price:`,
        products: affordable,
        quickReplies: ["Show all budgets", "Compare products", "Filter by category"],
      };
    }
  }

  // Compare intent
  if (intents.includes("compare") && ctx.mentionedProducts.length >= 2) {
    const [a, b] = ctx.mentionedProducts.slice(-2);
    return {
      text: buildComparisonTable(a, b),
      comparison: { a, b },
      quickReplies: [`Add ${a.name} to cart`, `Add ${b.name} to cart`, "See more options"],
    };
  }

  // Product recommendation — main path
  const scored = products
    .filter(p => p.inStock)
    .map(p => ({ product: p, score: scoreProduct(p, intents, budget || null) }))
    .sort((a, b) => b.score - a.score);

  const top3 = scored.slice(0, 3).map(s => s.product);

  if (top3.length === 0) {
    return {
      text: `Hmm, I couldn't find a perfect match right now. Our team is always adding new products — check back soon! In the meantime, want to see our bestsellers?`,
      quickReplies: ["Show bestsellers", "Speed suits", "Recovery gear"],
    };
  }

  // Generate contextual reply text
  let replyText = "";

  if (intents.includes("sprint")) {
    replyText = `For pure speed${budget?.max ? ` under $${budget.max}` : ""}, here's what our elite sprinters choose 🚀:`;
  } else if (intents.includes("marathon") || intents.includes("triathlon")) {
    replyText = `Built for endurance athletes${name} — these are the pieces that go the distance:`;
  } else if (intents.includes("recovery")) {
    replyText = `Recovery is where champions are built. Here's what I recommend${name}:`;
  } else if (intents.includes("training")) {
    replyText = `For gym and training sessions, these are performance-proven:`;
  } else if (intents.includes("gift")) {
    replyText = `Great gift idea! These are our most gifted products — always a hit with athletes:`;
  } else if (intents.includes("premium")) {
    replyText = `You want the best? Here's our top-rated elite arsenal${name} 🏆:`;
  } else {
    replyText = `Based on what you're looking for, here are my top picks${name}:`;
  }

  return {
    text: replyText,
    products: top3,
    quickReplies: ["Compare these", "See more options", "Different budget", "What's this made of?"],
  };
}

// ─── Streaming Text Hook ─────────────────────────────────────────────────────

function useStreamText(text: string, streaming: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!streaming) { setDisplayed(text); return; }
    setDisplayed("");
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, streaming, speed]);
  return displayed;
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function AgentBubble({
  message, onAddToCart
}: {
  message: Message;
  onAddToCart: (product: Product) => void;
}) {
  const displayed = useStreamText(message.text, message.streaming || false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-2"
    >
      {/* Deer avatar */}
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
        style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 12px rgba(106,0,255,0.4)" }}
      >
        🦌
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div
          className="rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed"
          style={{ background: "rgba(106,0,255,0.12)", border: "1px solid rgba(157,77,255,0.2)", color: "#e5e7eb" }}
        >
          <span style={{ whiteSpace: "pre-line" }}>{displayed}</span>
          {message.streaming && displayed.length < message.text.length && (
            <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>

        {/* Product cards */}
        {message.products && message.products.length > 0 && (
          <div className="space-y-2">
            {message.products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${p.accentColor}25` }}
              >
                {/* Color swatch */}
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${p.accentColor}30, ${p.accentColor}10)`, border: `1px solid ${p.accentColor}30` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-gray-500 text-[10px] truncate">{p.category}</p>
                  <p className="text-xs font-bold" style={{ color: p.accentColor }}>${p.price}</p>
                </div>
                <button
                  onClick={() => onAddToCart(p)}
                  className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${p.accentColor}, ${p.accentColor}90)`, boxShadow: `0 2px 12px ${p.accentColor}40` }}
                >
                  <ShoppingBag className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const STORAGE_KEY = "dd_ai_chat_v3";
const CTX_KEY = "dd_ai_ctx_v3";
const IDLE_NUDGE_MS = 35000;

export default function AIAgent() {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [ctx, setCtx] = useState<ConversationContext>({
    mentionedProducts: [],
    lastIntent: "",
    stage: "new",
    sessionStart: Date.now(),
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accentColor = "#9D4DFF";

  // Load from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
      const savedCtx = localStorage.getItem(CTX_KEY);
      if (savedCtx) setCtx(JSON.parse(savedCtx));
    } catch { /* ignore */ }
  }, []);

  // Save to storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  useEffect(() => {
    if (ctx) localStorage.setItem(CTX_KEY, JSON.stringify(ctx));
  }, [ctx]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      addAgentMessage(generateReply("hello", ["greeting"], getProducts(), ctx));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Idle nudge
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!open) return;
    idleTimerRef.current = setTimeout(() => {
      addAgentMessage({
        text: "Still looking? 🦌 Tell me your sport or budget and I'll narrow it down in seconds.",
        quickReplies: ["Speed suits 🚀", "Under $100 💰", "Best rated ⭐", "Recovery gear"],
      });
    }, IDLE_NUDGE_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { resetIdleTimer(); return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); }; }, [resetIdleTimer]);

  const addAgentMessage = useCallback((reply: { text: string; products?: Product[]; quickReplies?: string[]; comparison?: { a: Product; b: Product } }) => {
    const msg: Message = {
      id: `${Date.now()}-agent`,
      role: "agent",
      text: reply.text,
      products: reply.products,
      quickReplies: reply.quickReplies,
      timestamp: Date.now(),
      streaming: true,
    };
    setMessages(prev => [...prev, msg]);
    if (!open) setUnread(n => n + 1);
    // Mark streaming done after text finishes
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, streaming: false } : m));
    }, reply.text.length * 18 + 500);
  }, [open]);

  const handleSend = useCallback(async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText) return;
    setInput("");
    resetIdleTimer();

    // Add user message
    const userMsg: Message = { id: `${Date.now()}-user`, role: "user", text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    setTyping(true);
    // Simulate thinking
    await new Promise(r => setTimeout(r, 700 + Math.random() * 600));
    setTyping(false);

    const products = getProducts();
    const intents = detectIntents(userText);
    const budget = extractBudgetRange(userText);
    const size = extractSize(userText);

    // Update context
    const newCtx: ConversationContext = {
      ...ctx,
      lastIntent: intents[0] || ctx.lastIntent,
      stage: intents.includes("cart") || intents.includes("compare") ? "comparing" : ctx.stage === "new" ? "browsing" : ctx.stage,
      budgetRange: budget || ctx.budgetRange,
      preferredSize: size || ctx.preferredSize,
    };

    const reply = generateReply(userText, intents, products, newCtx);

    if (reply.products) {
      newCtx.mentionedProducts = [...(ctx.mentionedProducts || []), ...reply.products].slice(-4);
    }

    setCtx(newCtx);
    addAgentMessage(reply);
  }, [input, ctx, resetIdleTimer, addAgentMessage]);

  const handleAddToCart = useCallback((product: Product) => {
    addToCart(product, product.sizes[1] || product.sizes[0]);
    addAgentMessage({
      text: `Added **${product.name}** to your cart! 🛍️ Great choice. Want me to find anything else?`,
      quickReplies: ["Browse more", "View cart", "Recovery gear to pair with this"],
    });
  }, [addToCart, addAgentMessage]);

  const clearChat = () => {
    setMessages([]);
    setCtx({ mentionedProducts: [], lastIntent: "", stage: "new", sessionStart: Date.now() });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CTX_KEY);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl"
        style={{
          background: open ? "rgba(20,10,40,0.9)" : "linear-gradient(135deg, #6A00FF, #9D4DFF)",
          border: open ? "1px solid rgba(157,77,255,0.3)" : "none",
          boxShadow: open ? "0 0 0 rgba(0,0,0,0)" : "0 0 30px rgba(106,0,255,0.5), 0 0 60px rgba(106,0,255,0.2)",
        }}
        aria-label="DualDeer AI Agent"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="relative">
              <Sparkles className="w-6 h-6" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "#FF4D6D", color: "white" }}>
                  {unread}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{
              height: "min(600px, 80vh)",
              background: "rgba(8,4,16,0.97)",
              border: "1px solid rgba(157,77,255,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(157,77,255,0.1)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(106,0,255,0.08)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 16px rgba(106,0,255,0.5)" }}
              >
                🦌
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">Deer AI</p>
                  <Zap className="w-3 h-3" style={{ color: accentColor }} />
                </div>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Performance Advisor · Always Online
                </p>
              </div>
              <button onClick={clearChat} className="text-gray-600 hover:text-gray-400 transition-colors p-1" title="Clear chat">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-300 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin" style={{ scrollbarWidth: "none" }}>
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex justify-end"
                  >
                    <div
                      className="max-w-[78%] rounded-2xl rounded-tr-none px-4 py-2.5 text-sm text-white"
                      style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)" }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ) : (
                  <AgentBubble key={msg.id} message={msg} onAddToCart={handleAddToCart} />
                )
              )}

              {/* Latest quick replies */}
              {messages.length > 0 && messages[messages.length - 1]?.role === "agent" && messages[messages.length - 1]?.quickReplies && !typing && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 pl-9">
                  {(messages[messages.length - 1].quickReplies || []).map((qr) => (
                    <button
                      key={qr}
                      onClick={() => handleSend(qr)}
                      className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:scale-105"
                      style={{ background: "rgba(157,77,255,0.12)", color: "#C084FF", border: "1px solid rgba(157,77,255,0.25)" }}
                    >
                      {qr}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Typing indicator */}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
                    style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)" }}>🦌</div>
                  <div className="rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center"
                    style={{ background: "rgba(106,0,255,0.12)", border: "1px solid rgba(157,77,255,0.2)" }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }}
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(157,77,255,0.2)" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask Deer anything…"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                />
                <button
                  onClick={() => handleSend()}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 disabled:opacity-30"
                  disabled={!input.trim() || typing}
                  style={{ background: input.trim() ? "linear-gradient(135deg, #6A00FF, #9D4DFF)" : "rgba(255,255,255,0.05)" }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-center text-[9px] text-gray-700 mt-2 font-mono">Powered by DualDeer Intelligence · 100% Free</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
