"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Marcus V.",
    sport: "Olympic Sprinter",
    rating: 5,
    review: "The DualDeer suit feels like a second skin. My split times dropped by 0.3 seconds in the first week. Nothing else comes close.",
    accentColor: "#9D4DFF",
    verified: true,
  },
  {
    id: 2,
    name: "Elena R.",
    sport: "400m World Champion",
    rating: 5,
    review: "Incredible compression and comfort. It doesn't just reduce wind resistance — it actively pushes your body into optimal form.",
    accentColor: "#C084FF",
    verified: true,
  },
  {
    id: 3,
    name: "James T.",
    sport: "Triathlete",
    rating: 5,
    review: "Wore it through a full Ironman. The breathable mesh zones kept me cooler than any suit I've tried. Life-changing gear.",
    accentColor: "#6A00FF",
    verified: true,
  },
  {
    id: 4,
    name: "Aisha K.",
    sport: "Track & Field Coach",
    rating: 5,
    review: "I've recommended DualDeer to every athlete I coach. The muscle support mapping is genuinely backed by biomechanics research.",
    accentColor: "#00E5FF",
    verified: true,
  },
  {
    id: 5,
    name: "David M.",
    sport: "Competitive Cyclist",
    rating: 4,
    review: "Exceptional quality. The carbon fiber weave is unlike anything else on the market. Worth every cent.",
    accentColor: "#9D4DFF",
    verified: true,
  },
];

export default function CustomerReviews() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const prev = () => setActiveIdx((idx) => (idx === 0 ? reviews.length - 1 : idx - 1));
  const next = () => setActiveIdx((idx) => (idx === reviews.length - 1 ? 0 : idx + 1));

  const review = reviews[activeIdx];

  return (
    <section className="py-28 px-6 md:px-12 relative overflow-hidden" style={{ background: "#070512" }}>
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(106,0,255,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Neon top line */}
      <div className="neon-line absolute top-0 left-0 right-0" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: "#9D4DFF" }}>
            SOCIAL PROOF
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Trusted by <span className="text-gradient">Champions.</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Star className="w-4 h-4" fill="#9D4DFF" stroke="none" />
            <span>4.9 / 5 average</span>
            <span className="text-gray-600">·</span>
            <span>530+ verified reviews</span>
          </div>
        </motion.div>

        {/* Featured Review Card */}
        <div ref={sliderRef} className="relative">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl p-8 md:p-12 relative overflow-hidden"
            style={{
              background: "rgba(10, 5, 20, 0.8)",
              border: `1px solid ${review.accentColor}25`,
              boxShadow: `0 0 60px ${review.accentColor}10`,
            }}
          >
            {/* Quote mark */}
            <div
              className="absolute top-8 right-8 text-8xl font-serif leading-none opacity-10 select-none"
              style={{ color: review.accentColor }}
            >
              &quot;
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className="w-5 h-5"
                  fill={idx < review.rating ? review.accentColor : "transparent"}
                  stroke={review.accentColor}
                  strokeWidth={1.5}
                />
              ))}
            </div>

            {/* Review text */}
            <blockquote
              className="text-xl md:text-2xl font-light leading-relaxed mb-8 text-white italic"
              style={{ maxWidth: "680px" }}
            >
              &quot;{review.review}&quot;
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: `linear-gradient(135deg, ${review.accentColor}, ${review.accentColor}60)`,
                }}
              >
                {review.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-semibold">{review.name}</p>
                <p className="text-sm" style={{ color: review.accentColor }}>{review.sport}</p>
              </div>
              {review.verified && (
                <div
                  className="ml-auto text-xs font-mono tracking-widest px-3 py-1 rounded-full"
                  style={{
                    background: `${review.accentColor}15`,
                    color: review.accentColor,
                    border: `1px solid ${review.accentColor}30`,
                  }}
                >
                  VERIFIED
                </div>
              )}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {/* Dots */}
            <div className="flex gap-2">
              {reviews.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: activeIdx === idx ? "24px" : "8px",
                    height: "8px",
                    background: activeIdx === idx
                      ? `linear-gradient(to right, #6A00FF, #C084FF)`
                      : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-3">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
                  boxShadow: "0 0 20px rgba(106,0,255,0.3)",
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mini review strip */}
        <div className="hidden md:grid grid-cols-5 gap-3 mt-8">
          {reviews.map((r, idx) => (
            <button
              key={r.id}
              onClick={() => setActiveIdx(idx)}
              className="p-3 rounded-xl text-left transition-all duration-300"
              style={{
                background: idx === activeIdx ? `${r.accentColor}12` : "rgba(255,255,255,0.02)",
                border: idx === activeIdx ? `1px solid ${r.accentColor}30` : "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5" fill={r.accentColor} stroke="none" />
                ))}
              </div>
              <p className="text-xs text-gray-400 truncate leading-relaxed">{r.review.slice(0, 40)}...</p>
              <p className="text-xs mt-1 font-medium" style={{ color: r.accentColor }}>{r.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="neon-line absolute bottom-0 left-0 right-0" />
    </section>
  );
}
