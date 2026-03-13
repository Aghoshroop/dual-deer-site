"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function UXUtilities() {
  const { scrollYProgress } = useScroll();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      setShowBackToTop(v > 0.18);
    });
    return () => unsub();
  }, [scrollYProgress]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Scroll progress bar — thin violet line at top of viewport */}
      <motion.div
        className="fixed top-0 left-0 z-[100] h-[2px] origin-left"
        style={{
          scaleX: scrollYProgress,
          background: "linear-gradient(to right, #6A00FF, #9D4DFF, #C084FF)",
          boxShadow: "0 0 8px rgba(157,77,255,0.7)",
        }}
      />

      {/* Back-to-top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-24 left-6 z-40 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            style={{
              background: "rgba(106,0,255,0.2)",
              border: "1px solid rgba(157,77,255,0.3)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
