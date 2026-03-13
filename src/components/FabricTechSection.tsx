"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Wind, Activity, Cpu } from "lucide-react";

const features = [
  {
    icon: <Layers className="w-7 h-7" />,
    title: "Carbon Fiber Weave",
    description: "Micro-woven carbon threads provide rigid aerodynamic support exactly where connective tissue needs it most, reducing drag coefficient to 0.04 cd.",
    detail: "64-layer carbon integration",
    accentColor: "#9D4DFF",
  },
  {
    icon: <Wind className="w-7 h-7" />,
    title: "Breathable Mesh Zones",
    description: "Heat-mapped ventilation channels exhaust thermal buildup during peak exertion, keeping your core temperature in the optimal performance zone.",
    detail: "36 airflow micro-channels",
    accentColor: "#C084FF",
  },
  {
    icon: <Activity className="w-7 h-7" />,
    title: "Dynamic Compression",
    description: "Gradient active compression accelerates blood flow back to the heart, recovering energy instantly and reducing lactic acid buildup.",
    detail: "8-stage pressure gradient",
    accentColor: "#6A00FF",
  },
  {
    icon: <Cpu className="w-7 h-7" />,
    title: "Muscle Support Zones",
    description: "AI-modeled muscle support maps from 3,000+ athlete biomechanics sessions. Each zone targets specific muscle stabilization for explosive movements.",
    detail: "AI biomechanics mapping",
    accentColor: "#00E5FF",
  },
];

export default function FabricTechSection() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <section id="technology" className="py-32 px-6 md:px-12 relative border-y overflow-hidden" style={{ background: "#070512", borderColor: "rgba(157,77,255,0.08)" }}>
      {/* Ambient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(157,77,255,0.4), transparent)" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(106,0,255,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: "#9D4DFF" }}>
              MATERIAL SCIENCE
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Technology <span className="text-gradient">Breakdown.</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
              We didn&apos;t just design a suit. We engineered a new class of synthetic biology.
              The fabric reacts, adapts, and breathes with you.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const isActive = activeFeature === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                onClick={() => setActiveFeature(isActive ? null : i)}
                className="p-8 rounded-2xl cursor-pointer relative overflow-hidden group transition-all duration-400"
                style={{
                  background: isActive ? `${feature.accentColor}10` : "rgba(10,10,20,0.8)",
                  border: isActive ? `1px solid ${feature.accentColor}40` : "1px solid rgba(255,255,255,0.04)",
                  transform: isActive ? "translateY(-6px)" : "translateY(0)",
                  transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                  boxShadow: isActive ? `0 20px 60px ${feature.accentColor}20` : "none",
                }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 w-full h-0.5 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to right, transparent, ${feature.accentColor}, transparent)`,
                    opacity: isActive ? 1 : 0,
                  }}
                />

                {/* Background glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top-left, ${feature.accentColor}08, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <div
                  className="mb-6 p-3 inline-flex rounded-xl transition-all duration-300"
                  style={{
                    background: `${feature.accentColor}15`,
                    color: feature.accentColor,
                    boxShadow: isActive ? `0 0 24px ${feature.accentColor}30` : "none",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed text-sm">{feature.description}</p>

                {/* Detail badge */}
                <div
                  className="mt-5 inline-flex items-center gap-2 text-xs font-mono tracking-widest px-3 py-1.5 rounded-full"
                  style={{
                    background: `${feature.accentColor}10`,
                    color: feature.accentColor,
                    border: `1px solid ${feature.accentColor}20`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: feature.accentColor }}
                  />
                  {feature.detail}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tech stat bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          {[
            { value: "0.04 cd", label: "Drag Coefficient" },
            { value: "64 zones", label: "Compression Zones" },
            { value: "36%", label: "Less Muscle Fatigue" },
            { value: "3,000+", label: "Athlete Sessions" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold mb-2 text-gradient"
              >
                {stat.value}
              </div>
              <div className="text-xs font-mono tracking-widest text-gray-500 uppercase">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(157,77,255,0.4), transparent)" }}
      />
    </section>
  );
}
