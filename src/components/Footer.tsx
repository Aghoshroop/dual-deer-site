"use client";

import Link from "next/link";
import { Instagram, Twitter, Youtube, ArrowUpRight } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "Speed Suits", href: "/shop" },
    { label: "Compression", href: "/shop" },
    { label: "Training", href: "/shop" },
    { label: "Accessories", href: "/shop" },
  ],
  Explore: [
    { label: "Technology", href: "/#technology" },
    { label: "Athletes", href: "/#athletes" },
    { label: "Performance", href: "/#performance" },
    { label: "Brand Story", href: "/#" },
  ],
  Account: [
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Checkout", href: "/checkout" },
    { label: "Track Order", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Shipping Policy", href: "#" },
    { label: "Refunds", href: "#" },
  ],
};

const socials = [
  { icon: <Instagram className="w-4 h-4" />, href: "#", label: "Instagram" },
  { icon: <Twitter className="w-4 h-4" />, href: "#", label: "Twitter" },
  { icon: <Youtube className="w-4 h-4" />, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "#030308", borderTop: "1px solid rgba(157,77,255,0.08)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(106,0,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8 relative z-10">
        {/* Top row: Logo + Socials */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-10"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white mb-2">
              DUALDEER<span className="text-gradient">.</span>
            </div>
            <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
              Elite compression activewear engineered for speed, comfort, and performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(157,77,255,0.3)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(157,77,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-mono tracking-[0.2em] mb-4" style={{ color: "#9D4DFF" }}>
                {category.toUpperCase()}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: copyright */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs font-mono text-gray-700"
          style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
        >
          <span>© {new Date().getFullYear()} DUALDEER PERFORMANCE LAB. ALL RIGHTS RESERVED.</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#9D4DFF" }} />
            <span>ENGINEERED FOR SPEED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
