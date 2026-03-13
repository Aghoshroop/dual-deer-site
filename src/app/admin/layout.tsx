"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      const err = error as Error;
      setError(err.message || "Failed to authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(106,0,255,0.06) 0%, transparent 60%)" }}
      />
      <div className="neon-line absolute top-0 left-0 right-0" />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl p-8 relative z-10"
        style={{
          background: "rgba(10,5,20,0.95)",
          border: "1px solid rgba(157,77,255,0.2)",
          boxShadow: "0 0 60px rgba(106,0,255,0.1)",
        }}
      >
        <div className="text-center mb-6">
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
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(157,77,255,0.4)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(157,77,255,0.4)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.01] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
              boxShadow: "0 0 24px rgba(106,0,255,0.3)",
            }}
          >
            {isSubmitting ? "Processing..." : (isSignUp ? "Register Admin" : "Unlock Dashboard")}
          </button>
          
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back to site
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              {isSignUp ? "Switch to Login" : "First time? Register"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
