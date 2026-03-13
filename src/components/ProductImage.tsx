"use client";

import { useState, useEffect } from "react";
import { getImage } from "@/lib/imageStore";

interface ProductImageProps {
  /** Can be an IndexedDB image ID (e.g. "img_1234_abc"), a data URL, a regular URL, or alt-text/placeholder string */
  imageId: string | undefined;
  alt: string;
  accentColor: string;
  /** Extra className for the wrapper div */
  className?: string;
  /** Tailwind / inline style for the outer wrapper */
  style?: React.CSSProperties;
  /** Shown as the placeholder card ID label */
  productId?: number;
}

export default function ProductImage({
  imageId,
  alt,
  accentColor,
  className = "",
  style,
  productId,
}: ProductImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) { setSrc(null); return; }

    // Already a usable URL — use it directly
    if (
      imageId.startsWith("data:") ||
      imageId.startsWith("http") ||
      imageId.startsWith("/")
    ) {
      setSrc(imageId);
      return;
    }

    // It's an IndexedDB image ID — load it
    let cancelled = false;
    getImage(imageId).then((url) => {
      if (!cancelled) setSrc(url || null);
    });
    return () => { cancelled = true; };
  }, [imageId]);

  const hasRealImage = src && (src.startsWith("data:") || src.startsWith("http") || src.startsWith("/"));

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      {/* Ambient glow — always present, fades when image loaded */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at center, ${accentColor}18 0%, transparent 65%)`,
          opacity: hasRealImage ? 0.15 : 0.5,
        }}
      />

      {hasRealImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.92 }}
        />
      ) : (
        /* Placeholder glow orb */
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle, ${accentColor}50, ${accentColor}10)`,
              filter: "blur(12px)",
            }}
          />
        </div>
      )}

      {/* Product ID label — only shown when no image */}
      {!hasRealImage && productId !== undefined && (
        <div className="absolute inset-0 flex items-end justify-end p-3">
          <div className="text-xs font-mono opacity-20" style={{ color: accentColor }}>
            #{productId.toString().padStart(3, "0")}
          </div>
        </div>
      )}
    </div>
  );
}
