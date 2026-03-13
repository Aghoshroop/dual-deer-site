"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const FRAME_COUNT = 240;

const currentFrame = (index: number) =>
  `/frames/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`;

// Random particle data will be generated in useEffect to prevent hydration mismatch

export default function HeroSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef<number>(-1);

  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number; size: number; x: number; y: number; delay: number; duration: number; opacity: number;}>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 5 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 6,
        opacity: 0.3 + Math.random() * 0.5,
      }))
    );
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // PRELOAD IMAGES
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = currentFrame(i);

      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
        if (loadedCount === FRAME_COUNT) {
          setLoaded(true);
        }
      };

      images.push(img);
    }

    imagesRef.current = images;
  }, []);

  // CANVAS SETUP
  useEffect(() => {
    if (!loaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [loaded]);

  // DRAW FRAME
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img) return;

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    const canvasRatio = canvasWidth / canvasHeight;
    const imgRatio = img.width / img.height;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvasWidth / imgRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // SCROLL → FRAME MAPPING
  useEffect(() => {
    if (!loaded) return;

    const unsubscribe = scrollYProgress.on("change", (progress) => {
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(progress * FRAME_COUNT)
      );

      if (frameIndex === lastFrameRef.current) return;

      lastFrameRef.current = frameIndex;

      requestAnimationFrame(() => drawFrame(frameIndex));
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, scrollYProgress]);

  // TEXT ANIMATION via scroll progress
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.5], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.45, 0.55, 0.7, 0.75], [0, 1, 1, 0]);
  const opacity4 = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);

  // Parallax for background orb
  const orbY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div
      ref={containerRef}
      className="h-[500vh] bg-background relative w-full"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

        {/* Parallax radial violet lighting orb */}
        <motion.div
          style={{ y: orbY }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[900px] md:h-[900px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(106,0,255,0.22) 0%, rgba(157,77,255,0.08) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </motion.div>

        {/* Floating energy particles */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: `radial-gradient(circle, rgba(192,132,255,${p.opacity}), transparent)`,
                boxShadow: `0 0 ${p.size * 3}px rgba(157,77,255,0.6)`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 5 }}
        />

        {/* Cinematic vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 20,
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.7) 90%, rgba(5,5,5,0.95) 100%)",
          }}
        />

        {/* Top / Bottom gradient fade */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-70"
          style={{ zIndex: 21 }}
        />

        {/* Violet bottom-glow bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            zIndex: 30,
            background: "linear-gradient(to right, transparent, #9D4DFF, #C084FF, #9D4DFF, transparent)"
          }}
        />

        {/* Text overlays */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-6"
          style={{ zIndex: 30 }}
        >
          <motion.div style={{ opacity: opacity1 }} className="absolute">
            <h1
              className="text-4xl xxs:text-3xl xs:text-6xl md:text-8xl font-bold text-white tracking-widest mb-2 xs:mb-4"
              style={{ textShadow: "0 0 60px rgba(157,77,255,0.5), 0 0 120px rgba(106,0,255,0.3)" }}
            >
              DUALDEER
            </h1>
            <p className="text-base xxs:text-xs xs:text-xl md:text-3xl text-gradient">
              Engineered for speed.
            </p>
          </motion.div>

          <motion.div style={{ opacity: opacity2 }} className="absolute">
            <h2
              className="text-3xl xxs:text-xl xs:text-4xl md:text-7xl text-white mb-2 xs:mb-4 font-bold"
              style={{ textShadow: "0 0 40px rgba(157,77,255,0.4)" }}
            >
              Precision Compression.
            </h2>
            <p className="text-sm xxs:text-xs xs:text-xl md:text-2xl" style={{ color: "#C084FF" }}>
              Engineered muscle support.
            </p>
          </motion.div>

          <motion.div style={{ opacity: opacity3 }} className="absolute">
            <h2
              className="text-3xl xxs:text-xl xs:text-4xl md:text-7xl text-white max-w-4xl font-bold"
              style={{ textShadow: "0 0 40px rgba(157,77,255,0.4)" }}
            >
              Built for athletes who move faster.
            </h2>
          </motion.div>

          <motion.div style={{ opacity: opacity4 }} className="absolute mt-16 md:mt-32">
            <h2
              className="text-4xl xxs:text-2xl xs:text-5xl md:text-8xl font-bold text-white mb-4 md:mb-8"
              style={{ textShadow: "0 0 60px rgba(157,77,255,0.5)" }}
            >
              Unleash Maximum Velocity.
            </h2>
            <button
              className="pointer-events-auto px-4 py-2 xxs:px-3 xxs:py-1.5 xxs:text-xs xs:px-6 xs:py-3 md:px-8 md:py-4 font-semibold rounded-full transition-all shadow-lg text-white"
              style={{
                background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
                boxShadow: "0 0 40px rgba(106,0,255,0.5), 0 0 80px rgba(106,0,255,0.2)",
              }}
            >
              Explore the DualDeer Speed Suit
            </button>
          </motion.div>
        </div>

        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background" style={{ zIndex: 50 }}>
            <div className="mb-6">
              <div
                className="w-20 h-20 rounded-full animate-spin"
                style={{ border: "2px solid #3b0764", borderTopColor: "#a78bfa" }}
              />
            </div>
            <div className="font-mono text-sm tracking-widest mb-3" style={{ color: "#a78bfa" }}>
              LOADING SEQUENCE
            </div>
            <div className="w-48 rounded-full overflow-hidden" style={{ height: "1px", background: "#1a1a2e" }}>
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${loadProgress}%`,
                  background: "linear-gradient(to right, #6A00FF, #C084FF)"
                }}
              />
            </div>
            <div className="text-gray-600 text-xs mt-2 font-mono">{loadProgress}%</div>
          </div>
        )}

      </div>
    </div>
  );
}