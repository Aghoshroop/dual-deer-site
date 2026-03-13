"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const { success, error: err } = register(form.name, form.email, form.password);
      if (success) {
        router.push("/");
      } else {
        setError(err || "Registration failed.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(106,0,255,0.08) 0%, transparent 60%)" }}
      />
      <div className="neon-line absolute top-0 left-0 right-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white">
            DUALDEER<span className="text-gradient">.</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Join the Performance Club</p>
        </div>

        <div className="rounded-2xl p-8" style={{
          background: "rgba(10,5,20,0.9)",
          border: "1px solid rgba(157,77,255,0.15)",
          boxShadow: "0 0 60px rgba(106,0,255,0.08)",
        }}>
          <h1 className="text-xl font-bold text-white mb-6">Create Account</h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name", label: "Full Name", type: "text", placeholder: "Marcus Veloce" },
              { key: "email", label: "Email", type: "email", placeholder: "athlete@example.com" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-mono text-gray-500 mb-1.5 tracking-widest">{field.label.toUpperCase()}</label>
                <input
                  type={field.type}
                  required
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => { setForm((f) => ({ ...f, [field.key]: e.target.value })); setError(""); }}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(157,77,255,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1.5 tracking-widest">PASSWORD</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required
                  value={form.password}
                  onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setError(""); }}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-10 rounded-xl text-white text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(157,77,255,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
                />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1.5 tracking-widest">CONFIRM PASSWORD</label>
              <input type="password" required
                value={form.confirm}
                onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setError(""); }}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(157,77,255,0.4)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.01] mt-2"
              style={{
                background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
                boxShadow: "0 0 28px rgba(106,0,255,0.35)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="hover:text-white transition-colors" style={{ color: "#C084FF" }}>
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          <Link href="/" className="hover:text-gray-500 transition-colors">← Back to DualDeer</Link>
        </p>
      </motion.div>
    </main>
  );
}
