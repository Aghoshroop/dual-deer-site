"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";

const athletes = [
  {
    id: 1,
    name: "Marcus V.",
    sport: "Olympic Sprinter",
    country: "USA 🇺🇸",
    achievement: "World Record, 100m",
    quote: "The DualDeer suit feels like a second skin. My split times dropped by 0.3 seconds in the first week.",
    accentColor: "#9D4DFF",
    image: "/athletes/marcus.png",
  },
  {
    id: 2,
    name: "Elena R.",
    sport: "400m World Champion",
    country: "Germany 🇩🇪",
    achievement: "3× World Champion",
    quote: "It doesn't just reduce wind resistance. It actively forces my posture into the optimal drive phase angle during the start.",
    accentColor: "#C084FF",
    image: "/athletes/elena.png",
  },
  {
    id: 3,
    name: "James T.",
    sport: "Triathlete",
    country: "Australia 🇦🇺",
    achievement: "Ironman Champion",
    quote: "Wore it through a full Ironman. The breathable mesh zones kept me performing at peak for 10 hours straight.",
    accentColor: "#00E5FF",
    image: "/athletes/james.png",
  },
  {
    id: 4,
    name: "Aisha K.",
    sport: "Long Jump Elite",
    country: "Kenya 🇰🇪",
    achievement: "Commonwealth Gold",
    quote: "The muscle support mapping is unlike anything I've felt. It almost thinks ahead of my movements.",
    accentColor: "#6A00FF",
    image: "/athletes/aisha.png",
  },
];

export default function AthleteSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const athlete = athletes[activeIdx];
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const prev = () => setActiveIdx((i) => (i === 0 ? athletes.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === athletes.length - 1 ? 0 : i + 1));

  return (
    <section
      ref={sectionRef}
      id="athletes"
      className="py-28 px-6 md:px-12 bg-background relative border-y overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      {/* Parallax ambient glow */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 translate-x-1/3 rounded-full"
          style={{
            background: `radial-gradient(circle, ${athlete.accentColor}10 0%, transparent 70%)`,
            transition: "background 0.6s ease",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute top-1/2 left-0 w-[400px] h-[400px] -translate-y-1/2 -translate-x-1/3 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: "#9D4DFF" }}>
            ELITE ATHLETES
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Tested by <span className="text-gradient">Champions.</span>
          </h2>
        </motion.div>

        {/* Main display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-10">
          {/* Left: Portrait with real image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: -30, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.97 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden"
              style={{
                height: "520px",
                border: `1px solid ${athlete.accentColor}25`,
                boxShadow: `0 0 80px ${athlete.accentColor}15`,
              }}
            >
              {/* Real athlete image */}
              <Image
                src={athlete.image}
                alt={`${athlete.name} — ${athlete.sport}`}
                fill
                className="object-cover object-top"
                style={{ transition: "opacity 0.4s ease" }}
              />
              {/* Color grade overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom right, ${athlete.accentColor}15 0%, transparent 50%, rgba(5,5,8,0.3) 100%)`,
                }}
              />
              {/* Bottom info panel */}
              <div
                className="absolute bottom-0 left-0 right-0 p-8"
                style={{ background: "linear-gradient(to top, rgba(5,5,8,0.98) 0%, rgba(5,5,8,0.7) 50%, transparent 100%)" }}
              >
                <p className="text-xs font-mono tracking-widest mb-3" style={{ color: athlete.accentColor }}>
                  {athlete.achievement}
                </p>
                <blockquote className="text-base font-light italic leading-relaxed text-gray-200 mb-5">
                  &quot;{athlete.quote}&quot;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${athlete.accentColor}, ${athlete.accentColor}60)` }}
                  >
                    {athlete.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{athlete.name}</p>
                    <p className="text-sm text-gray-400">{athlete.sport} · {athlete.country}</p>
                  </div>
                </div>
              </div>
              {/* Top badge */}
              <div className="absolute top-4 right-4">
                <span
                  className="text-[9px] font-mono tracking-[0.3em] px-3 py-1 rounded-full"
                  style={{ background: `${athlete.accentColor}15`, color: athlete.accentColor, border: `1px solid ${athlete.accentColor}30` }}
                >
                  VERIFIED ATHLETE
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right: Selector */}
          <div className="space-y-4">
            <p className="text-xs font-mono tracking-widest text-gray-500 mb-6 uppercase">Select Athlete</p>
            {athletes.map((a, idx) => (
              <button
                key={a.id}
                onClick={() => setActiveIdx(idx)}
                className="w-full text-left p-5 rounded-2xl transition-all duration-300 flex items-center gap-4"
                style={{
                  background: idx === activeIdx ? `${a.accentColor}10` : "rgba(255,255,255,0.02)",
                  border: idx === activeIdx ? `1px solid ${a.accentColor}35` : "1px solid rgba(255,255,255,0.04)",
                  transform: idx === activeIdx ? "translateX(8px)" : "translateX(0)",
                  boxShadow: idx === activeIdx ? `0 4px 24px ${a.accentColor}15` : "none",
                }}
              >
                {/* Mini athlete thumbnail */}
                <div
                  className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden relative"
                  style={{ border: `1.5px solid ${idx === activeIdx ? a.accentColor + "50" : "rgba(255,255,255,0.06)"}` }}
                >
                  <Image src={a.image} alt={a.name} fill className="object-cover object-top" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{a.name}</p>
                  <p className="text-sm text-gray-500 truncate">{a.sport}</p>
                  <p className="text-xs mt-0.5" style={{ color: a.accentColor }}>{a.achievement}</p>
                </div>
                {idx === activeIdx && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: a.accentColor, boxShadow: `0 0 8px ${a.accentColor}` }}
                  />
                )}
              </button>
            ))}

            {/* Nav arrows */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, #6A00FF, #9D4DFF)`,
                  boxShadow: "0 0 20px rgba(106,0,255,0.35)",
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="ml-auto text-xs font-mono text-gray-600 self-center">
                {activeIdx + 1} / {athletes.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
