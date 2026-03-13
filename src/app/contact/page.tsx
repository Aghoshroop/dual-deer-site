"use client";

export default function ContactPage() {
  return (
    <main className="bg-[#050508] min-h-screen">
      <section className="relative pt-36 pb-32 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute top-0 right-1/4 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, transparent 65%)", filter: "blur(80px)" }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <p className="text-xs font-mono tracking-[0.4em] mb-6 uppercase" style={{ color: "#9D4DFF" }}>Get In Touch</p>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-6">
            Let&apos;s Talk<br />
            <span style={{ background: "linear-gradient(135deg, #9D4DFF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Performance.</span>
          </h1>
          <p className="text-gray-400 text-lg mb-16 max-w-xl">
            Whether it&apos;s wholesale, sponsorship, or a simple question — we&apos;re real people who actually respond.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact form */}
            <div
              className="p-8 rounded-3xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}
            >
              <h2 className="text-white font-bold text-xl mb-6">Send a Message</h2>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  {["First Name", "Last Name"].map((label) => (
                    <div key={label}>
                      <label className="block text-[10px] font-mono tracking-[0.25em] text-gray-500 mb-2 uppercase">{label}</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                      />
                    </div>
                  ))}
                </div>
                {[
                  { label: "Email", type: "email" },
                  { label: "Subject", type: "text" },
                ].map(({ label, type }) => (
                  <div key={label}>
                    <label className="block text-[10px] font-mono tracking-[0.25em] text-gray-500 mb-2 uppercase">{label}</label>
                    <input
                      type={type}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-mono tracking-[0.25em] text-gray-500 mb-2 uppercase">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us what you need..."
                    className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-full text-white font-black text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 30px rgba(106,0,255,0.35)" }}
                >
                  Send Message →
                </button>
              </form>
            </div>

            {/* Info cards */}
            <div className="space-y-6">
              {[
                {
                  emoji: "📦",
                  title: "Wholesale & Bulk Orders",
                  body: "Team kits, club orders, or institutional bulk purchases. Minimum 10 units. Discounts from 15%.",
                },
                {
                  emoji: "🏅",
                  title: "Athlete Sponsorship",
                  body: "We sponsor athletes who align with our values. Send your competition history and a short video.",
                },
                {
                  emoji: "📬",
                  title: "General Support",
                  body: "Order issues, sizing questions, returns — we respond within 24 hours, 7 days a week.",
                },
              ].map(({ emoji, title, body }) => (
                <div
                  key={title}
                  className="p-6 rounded-2xl flex gap-5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-3xl flex-shrink-0">{emoji}</span>
                  <div>
                    <h3 className="text-white font-bold mb-1.5">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}

              <div
                className="p-5 rounded-2xl flex items-center gap-4"
                style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.12)" }}
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <p className="text-sm text-gray-400">
                  <span className="text-green-400 font-semibold">Average response time: 4 hours</span> — Mon to Sun, 9am–9pm IST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
