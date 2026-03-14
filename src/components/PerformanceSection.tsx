"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { onSettingsUpdate } from "@/lib/store";

export default function PerformanceSection() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to Firestore real-time updates — all devices receive the same URL instantly
    const unsubscribe = onSettingsUpdate((data) => {
      if (data.performanceImage && typeof data.performanceImage === "string") {
        setImageSrc(data.performanceImage);
      } else if (data.performanceImage === null || data.performanceImage === undefined) {
        setImageSrc(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section id="performance" className="py-32 px-6 md:px-12 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          {/* ── Left: text content ── */}
          <div>
            <h2 className="text-sm font-mono tracking-[0.2em] text-accent-blue uppercase mb-6">
              Performance Architecture
            </h2>
            <h3 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-8">
              Speed is<br />engineered.
            </h3>
            <p className="text-xl text-gray-400 font-light mb-8 max-w-md leading-relaxed">
              Every millimeter of the DualDeer speed suit is mathematically optimized. We mapped human biomechanics to create a second skin that reduces drag and amplifies kinetic output.
            </p>

            <div className="space-y-6">
              {[
                {
                  title: "0.04 cd Drag Coefficient",
                  body: "Wind-tunnel tested to cut through air resistance invisibly.",
                },
                {
                  title: "Targeted Muscle Support",
                  body: "Reduces muscle oscillation and fatigue during maximum velocity sprints.",
                },
                {
                  title: "64-Layer Carbon Micro-Fiber",
                  body: "Military-grade compression substrate — 40% stronger than standard compression fabric.",
                },
              ].map((stat) => (
                <div key={stat.title} className="flex items-start">
                  <div className="h-px w-12 bg-accent-blue mt-3 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold text-lg">{stat.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{stat.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: image panel ── */}
          <div className="relative h-[600px] w-full rounded-2xl overflow-hidden glass-panel group">
            {/* Blue tint overlay (always present) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-blue/10 to-transparent mix-blend-overlay group-hover:from-accent-blue/20 transition-all duration-700 z-10" />

            {imageSrc ? (
              /* ── Admin-set image from ImgBB CDN — visible on ALL devices ── */
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="DualDeer Performance Architecture — Carbon compression suit engineering"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Bottom gradient for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              </>
            ) : (
              /* ── Animated placeholder until admin uploads via Admin → Settings ── */
              <>
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className="border border-white/10" />
                  ))}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-blue/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
                  <div className="text-4xl mb-3 opacity-30">📸</div>
                  <p className="text-xs font-mono text-gray-600 tracking-widest opacity-60">
                    Upload via Admin → Settings
                  </p>
                </div>
              </>
            )}

            <div className="absolute bottom-8 left-8 right-8 text-xs font-mono tracking-widest text-gray-400 flex justify-between z-20">
              <span>AERODYNAMIC SIMULATION</span>
              <span>DATA {'>'} 99.9%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
