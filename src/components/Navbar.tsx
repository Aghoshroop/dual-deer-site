"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronDown, User, LogOut, Search, Menu, X } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import SearchBar from "./SearchBar";

const SHOP_DROPS = [
  { label: "All Products", href: "/shop" },
  { label: "Speed Suits", href: "/shop?cat=Speed%20Suits" },
  { label: "Compression", href: "/shop?cat=Compression" },
  { label: "Training", href: "/shop?cat=Training" },
  { label: "Accessories", href: "/shop?cat=Accessories" },
];

const NAV_LINKS = [
  { label: "Shop", href: "/shop", hasDrop: true },
  { label: "Technology", href: "/#technology", hasDrop: false },
  { label: "Our Story", href: "/story", hasDrop: false },
  { label: "Contact", href: "/contact", hasDrop: false },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, openCart } = useCart();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close mobile menu on route change (nav click)
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(5,5,8,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(157,77,255,0.1)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-xl font-black tracking-tight text-white hover:opacity-80 transition-opacity z-10">
            DUALDEER<span style={{ background: "linear-gradient(135deg,#9D4DFF,#C084FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>.</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative group"
                onMouseEnter={() => link.hasDrop && setShopOpen(true)}
                onMouseLeave={() => link.hasDrop && setShopOpen(false)}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/[0.04]"
                >
                  {link.label}
                  {link.hasDrop && (
                    <ChevronDown
                      className="w-3 h-3 text-gray-600 transition-transform duration-200"
                      style={{ transform: shopOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  )}
                </Link>

                {/* Hover underline accent */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ background: "linear-gradient(to right, #6A00FF, #C084FF)" }}
                />

                {/* Shop dropdown */}
                {link.hasDrop && (
                  <AnimatePresence>
                    {shopOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 mt-1 rounded-2xl overflow-hidden py-1.5"
                        style={{
                          background: "rgba(8,4,18,0.97)",
                          border: "1px solid rgba(157,77,255,0.18)",
                          backdropFilter: "blur(24px)",
                          minWidth: 190,
                          boxShadow: "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(157,77,255,0.05)",
                        }}
                      >
                        {SHOP_DROPS.map((d, i) => (
                          <Link
                            key={d.label}
                            href={d.href}
                            onClick={() => setShopOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                          >
                            {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />}
                            {i > 0 && <span className="w-1.5 h-1.5 rounded-full bg-gray-700 flex-shrink-0" />}
                            {d.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Right: Search + Auth + Cart + Mobile toggle */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:block text-xs font-mono text-gray-600">⌘K</span>
            </button>

            {/* Auth */}
            <div className="relative hidden md:block">
              {isLoggedIn ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-xl hover:bg-white/[0.04]"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs"
                      style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)" }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block max-w-[80px] truncate text-sm">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full right-0 mt-2 rounded-2xl overflow-hidden w-44 py-1"
                        style={{
                          background: "rgba(8,4,18,0.97)",
                          border: "1px solid rgba(157,77,255,0.15)",
                          backdropFilter: "blur(24px)",
                          boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                        }}
                      >
                        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                          <p className="text-gray-600 text-xs truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all hover:bg-white/[0.04]"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:block">Login</span>
                </Link>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-black text-white rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
              style={{
                background: "rgba(5,5,8,0.97)",
                borderTop: "1px solid rgba(157,77,255,0.1)",
              }}
            >
              <div className="px-6 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeMobile}
                    className="block px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {isLoggedIn ? (
                    <button
                      onClick={() => { logout(); closeMobile(); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white"
                    >
                      <User className="w-4 h-4" /> Login / Register
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
