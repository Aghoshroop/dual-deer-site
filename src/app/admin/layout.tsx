"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PIN = "DUAL2024";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(106,0,255,0.06) 0%, transparent 60%)" }}
      />
      <div className="neon-line absolute top-0 left-0 right-0" />

      <div
        className="w-full max-w-sm rounded-2xl p-8 relative z-10"
        style={{
          background: "rgba(10,5,20,0.95)",
          border: "1px solid rgba(157,77,255,0.2)",
          boxShadow: "0 0 60px rgba(106,0,255,0.1)",
        }}
      >
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(157,77,255,0.12)", border: "1px solid rgba(157,77,255,0.25)" }}
          >
            <span className="text-lg">🔒</span>
          </div>
          <h1 className="text-lg font-bold text-white">Admin Access</h1>
          <p className="text-xs text-gray-600 mt-1 font-mono">DUALDEER INTERNAL DASHBOARD</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-xs text-red-400 text-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Enter admin PIN"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pin === ADMIN_PIN) setUnlocked(true);
                else setError("Invalid PIN.");
              }
            }}
            className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none text-center tracking-[0.3em] font-mono"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(157,77,255,0.4)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
          />
          <button
            onClick={() => {
              if (pin === ADMIN_PIN) setUnlocked(true);
              else setError("Invalid PIN. Hint: DUAL2024");
            }}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
              boxShadow: "0 0 24px rgba(106,0,255,0.3)",
            }}
          >
            Unlock Dashboard
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full text-center text-xs text-gray-700 hover:text-gray-500 transition-colors py-1"
          >
            ← Back to site
          </button>
        </div>
      </div>
    </div>
  );
}
