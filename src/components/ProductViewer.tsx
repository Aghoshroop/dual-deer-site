"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ThreeDCanvas from "./ThreeDCanvas";


const COLOR_OPTIONS = [
  { label: "Void Violet", hex: "#9D4DFF" },
  { label: "Cyber Cyan", hex: "#00E5FF" },
  { label: "Electric Indigo", hex: "#6A00FF" },
  { label: "Carbon White", hex: "#e5e7eb" },
];

const DATA_LABELS = [
  { label: "Drag Coefficient", value: "0.04 Cd" },
  { label: "Compression Zones", value: "12 Active" },
  { label: "Fiber Layers", value: "64 Micro" },
  { label: "Moisture Wicking", value: "3× Faster" },
];


export default function ProductViewer() {
  const [activeColor, setActiveColor] = useState(0);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${COLOR_OPTIONS[activeColor].hex}15 0%, transparent 70%)`,
          filter: "blur(80px)",
          transition: "background 0.5s ease",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-mono tracking-[0.4em] mb-4" style={{ color: COLOR_OPTIONS[activeColor].hex }}>
            INTERACTIVE 3D MODEL
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Explore the <span className="text-gradient">Architecture.</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Drag to rotate. Every geometry represents a real engineering zone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-center">
          {/* 3D Canvas — wrapped in error boundary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              height: 520,
              background: "linear-gradient(135deg, #0a0418 0%, #050508 50%, #0a0418 100%)",
              border: `1px solid ${COLOR_OPTIONS[activeColor].hex}20`,
              boxShadow: `0 0 60px ${COLOR_OPTIONS[activeColor].hex}10`,
              transition: "border-color 0.5s ease, box-shadow 0.5s ease",
            }}
          >
            <ThreeDCanvas colorHex={COLOR_OPTIONS[activeColor].hex} />

            <div className="absolute top-4 left-4 text-[9px] font-mono tracking-widest text-gray-600 z-10 pointer-events-none">
              DUALDEER · SPEED SUIT V3
            </div>
            <div
              className="absolute bottom-4 right-4 text-[9px] font-mono tracking-widest z-10 pointer-events-none"
              style={{ color: `${COLOR_OPTIONS[activeColor].hex}70` }}
            >
              DRAG TO ROTATE
            </div>
          </motion.div>

          {/* Right panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Color selector */}
            <div>
              <p className="text-xs font-mono tracking-widest text-gray-500 mb-4">SELECT COLORWAY</p>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((c, i) => (
                  <button
                    key={c.label}
                    onClick={() => setActiveColor(i)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300"
                    style={{
                      background: i === activeColor ? `${c.hex}18` : "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${i === activeColor ? c.hex + "60" : "rgba(255,255,255,0.06)"}`,
                      color: i === activeColor ? c.hex : "#6b7280",
                      transform: i === activeColor ? "scale(1.05)" : "scale(1)",
                      boxShadow: i === activeColor ? `0 4px 20px ${c.hex}25` : "none",
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: c.hex, boxShadow: `0 0 6px ${c.hex}` }}
                    />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical data */}
            <div>
              <p className="text-xs font-mono tracking-widest text-gray-500 mb-4">PERFORMANCE DATA</p>
              <div className="grid grid-cols-2 gap-3">
                {DATA_LABELS.map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${COLOR_OPTIONS[activeColor].hex}18` }}
                  >
                    <p className="text-xl font-black" style={{ color: COLOR_OPTIONS[activeColor].hex }}>{value}</p>
                    <p className="text-[10px] text-gray-600 mt-1 font-mono">{label.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                "64-layer carbon micro-fiber weave",
                "12-zone biomechanical compression",
                "DuPont™ aerodynamic outer shell",
                "Graphene moisture-wick inner layer",
                "Seam-free for minimal drag friction",
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-3 text-sm text-gray-400">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                    style={{ background: COLOR_OPTIONS[activeColor].hex }}
                  />
                  {feat}
                </div>
              ))}
            </div>

            <motion.a
              href="/shop"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm"
              style={{
                background: `linear-gradient(135deg, #6A00FF, ${COLOR_OPTIONS[activeColor].hex})`,
                boxShadow: `0 0 40px ${COLOR_OPTIONS[activeColor].hex}40`,
              }}
            >
              Shop This Suit →
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
