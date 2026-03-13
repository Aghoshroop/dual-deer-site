"use client";

import { useEffect, useRef } from "react";

interface Props {
  colorHex: string;
}

// Pure HTML5 Canvas 3D suit renderer — no WebGL, no three.js, zero crashes
export default function ThreeDCanvas({ colorHex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ y: 0, x: 0, autoY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / canvas.width) * 2 - 1,
        y: ((e.clientY - rect.top) / canvas.height) * 2 - 1,
      };
    };
    canvas.addEventListener("mousemove", onMouseMove);

    // Parse hex to rgb
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    // 3D projection helper
    const project = (x: number, y: number, z: number, rotY: number, rotX: number, w: number, h: number) => {
      // Rotate around Y axis
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      // Rotate around X axis
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      // Perspective projection
      const fov = 600;
      const depth = fov + z2;
      const px = (x1 / depth) * fov + w / 2;
      const py = (y1 / depth) * fov + h / 2;
      return { px, py, depth: z2, scale: fov / depth };
    };

    // Suit geometry — body parts as capsule approximations (list of segments)
    const buildSuit = () => {
      const segments: { x: number; y: number; z: number; r: number; type: string }[] = [];
      // Torso — tall oval
      for (let i = 0; i < 14; i++) {
        const t = (i / 13) * Math.PI;
        segments.push({ x: 0, y: -65 + i * 10, z: 0, r: 30 - Math.abs(i - 6.5) * 1.2, type: "torso" });
      }
      // Left shoulder
      for (let i = 0; i < 5; i++) {
        segments.push({ x: -40 - i * 3, y: -55 + i * 7, z: 0, r: 14 - i * 1.5, type: "shoulder" });
      }
      // Right shoulder
      for (let i = 0; i < 5; i++) {
        segments.push({ x: 40 + i * 3, y: -55 + i * 7, z: 0, r: 14 - i * 1.5, type: "shoulder" });
      }
      // Left leg
      for (let i = 0; i < 10; i++) {
        segments.push({ x: -16, y: 70 + i * 9, z: 0, r: 14 - i * 0.4, type: "leg" });
      }
      // Right leg
      for (let i = 0; i < 10; i++) {
        segments.push({ x: 16, y: 70 + i * 9, z: 0, r: 14 - i * 0.4, type: "leg" });
      }
      return segments;
    };

    const suitSegments = buildSuit();

    // Particle system
    const NUM_PARTICLES = 120;
    const particles: { theta: number; phi: number; r: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.random() * Math.PI,
        r: 170 + Math.random() * 30,
        speed: 0.002 + Math.random() * 0.004,
        opacity: 0.2 + Math.random() * 0.5,
      });
    }

    let time = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const rgb = hexToRgb(colorHex);
      const colorStr = `rgb(${rgb.r},${rgb.g},${rgb.b})`;

      // Smooth mouse-follow rotation
      const targetY = mouseRef.current.x * 0.5;
      const targetX = -mouseRef.current.y * 0.18;
      rotRef.current.autoY += 0.004;
      rotRef.current.y += (targetY + rotRef.current.autoY - rotRef.current.y) * 0.04;
      rotRef.current.x += (targetX - rotRef.current.x) * 0.06;

      const rotY = rotRef.current.y;
      const rotX = rotRef.current.x;

      // Draw orbit ring
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(1, 0.3);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 175, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw particles (orbiting sphere)
      const projParticles: { px: number; py: number; depth: number; scale: number; opacity: number }[] = [];
      for (const p of particles) {
        p.theta += p.speed;
        const px3d = p.r * Math.sin(p.phi) * Math.cos(p.theta);
        const py3d = p.r * Math.cos(p.phi) * 0.65;
        const pz3d = p.r * Math.sin(p.phi) * Math.sin(p.theta);
        const proj = project(px3d, py3d, pz3d, rotY, rotX, w, h);
        projParticles.push({ ...proj, opacity: p.opacity });
      }
      // Sort back-to-front
      projParticles.sort((a, b) => a.depth - b.depth);
      for (const p of projParticles) {
        const α = (p.depth > 0 ? 0.6 : 0.3) * p.opacity;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.scale * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${α.toFixed(2)})`;
        ctx.fill();
      }

      // Draw suit segments (sorted by depth)
      const projSegments = suitSegments.map(seg => {
        const proj = project(seg.x, seg.y, seg.z, rotY, rotX, w, h);
        return { ...proj, r: seg.r * proj.scale, type: seg.type, origR: seg.r };
      }).sort((a, b) => a.depth - b.depth);

      for (const seg of projSegments) {
        const lightFactor = 0.5 + (seg.depth / 250) * 0.5;
        const lr = Math.min(255, Math.round(rgb.r * lightFactor));
        const lg = Math.min(255, Math.round(rgb.g * lightFactor));
        const lb = Math.min(255, Math.round(rgb.b * lightFactor));

        // Glow
        const grd = ctx.createRadialGradient(seg.px, seg.py, 0, seg.px, seg.py, seg.r * 2.2);
        grd.addColorStop(0, `rgba(${lr},${lg},${lb},0.18)`);
        grd.addColorStop(1, `rgba(${lr},${lg},${lb},0)`);
        ctx.beginPath();
        ctx.arc(seg.px, seg.py, seg.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Body fill
        const bodyGrd = ctx.createRadialGradient(seg.px - seg.r * 0.3, seg.py - seg.r * 0.3, 0, seg.px, seg.py, seg.r);
        bodyGrd.addColorStop(0, `rgba(${Math.min(255, lr + 40)},${Math.min(255, lg + 40)},${Math.min(255, lb + 40)},0.85)`);
        bodyGrd.addColorStop(0.7, `rgba(${lr},${lg},${lb},0.65)`);
        bodyGrd.addColorStop(1, `rgba(${Math.round(lr * 0.3)},${Math.round(lg * 0.3)},${Math.round(lb * 0.3)},0.5)`);
        ctx.beginPath();
        ctx.arc(seg.px, seg.py, Math.max(2, seg.r), 0, Math.PI * 2);
        ctx.fillStyle = bodyGrd;
        ctx.fill();
      }

      // Chest accent stripe (animated)
      const chestProj = project(0, -20, 28, rotY, rotX, w, h);
      const stripeW = 28 * chestProj.scale;
      const stripeH = 5 * chestProj.scale;
      ctx.save();
      ctx.globalAlpha = 0.85 + Math.sin(time * 2) * 0.15;
      ctx.shadowColor = colorStr;
      ctx.shadowBlur = 12;
      ctx.fillStyle = `rgba(240,240,255,0.9)`;
      ctx.beginPath();
      ctx.ellipse(chestProj.px, chestProj.py, stripeW, stripeH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // DualDeer glow orb pulse
      const orbY = -20 + Math.sin(time * 1.5) * 4;
      const orbProj = project(0, orbY, 32, rotY, rotX, w, h);
      const orbR = 6 * orbProj.scale;
      const orbGrd = ctx.createRadialGradient(orbProj.px, orbProj.py, 0, orbProj.px, orbProj.py, orbR * 3);
      orbGrd.addColorStop(0, `rgba(192,132,255,${0.9 + Math.sin(time * 2) * 0.1})`);
      orbGrd.addColorStop(0.5, `rgba(157,77,255,0.4)`);
      orbGrd.addColorStop(1, `rgba(106,0,255,0)`);
      ctx.beginPath();
      ctx.arc(orbProj.px, orbProj.py, orbR * 3, 0, Math.PI * 2);
      ctx.fillStyle = orbGrd;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(orbProj.px, orbProj.py, orbR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220,180,255,0.95)";
      ctx.fill();

      time += 0.016;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, [colorHex]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      style={{ background: "transparent" }}
    />
  );
}
