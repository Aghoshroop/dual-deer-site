import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story — DualDeer",
  description: "DualDeer was born from a single obsession: speed. Discover how we built the world's most technically advanced performance activewear from garage to global.",
  alternates: { canonical: "https://www.dualdeer.com/story" },
};

export default function StoryPage() {
  return (
    <main className="bg-[#050508] min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(106,0,255,0.12) 0%, transparent 65%)", filter: "blur(60px)" }}
        />
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="text-xs font-mono tracking-[0.4em] mb-6 uppercase" style={{ color: "#9D4DFF" }}>
            Our Story
          </p>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] mb-8">
            Built from<br />
            <span style={{ background: "linear-gradient(135deg, #9D4DFF, #C084FF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Obsession.
            </span>
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed max-w-2xl">
            DualDeer didn&apos;t start in a boardroom. It started in a garage, at 2am, with two athletes who were tired of wearing suits that slowed them down.
          </p>
        </div>
      </section>

      {/* Story sections */}
      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-4xl mx-auto space-y-24">

          {[
            {
              year: "2019",
              title: "The Problem",
              body: "We were competing at the regional level and every kit we tried was either restrictive, uncomfortable, or fell apart after six washes. None of them were built for the athlete — they were built for the shelf.",
            },
            {
              year: "2021",
              title: "The Breakthrough",
              body: "After two years of R&D, collaborating with textile engineers and biomechanics researchers, we developed our signature 64-layer carbon micro-fiber weave — the same material that's now in every DualDeer suit.",
            },
            {
              year: "2023",
              title: "Elite Validation",
              body: "Athletes using early DualDeer prototypes broke three personal records at national qualifiers. Word spread. Orders tripled in six weeks. We knew we had something real.",
            },
            {
              year: "Today",
              title: "The Mission",
              body: "Every suit we make carries one promise: we will never compromise technical performance for profit. DualDeer is, and will always be, engineered for the athlete first.",
            },
          ].map(({ year, title, body }) => (
            <div key={year} className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-8 md:gap-16 items-start">
              <div>
                <p className="text-3xl font-black" style={{ color: "#9D4DFF" }}>{year}</p>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-4">{title}</h2>
                <p className="text-gray-400 text-lg leading-relaxed">{body}</p>
              </div>
            </div>
          ))}

          {/* Values grid */}
          <div>
            <p className="text-xs font-mono tracking-[0.4em] mb-10 uppercase" style={{ color: "#9D4DFF" }}>Our Values</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Performance First", desc: "Every design decision is evaluated against one metric: does it make the athlete faster?" },
                { title: "Radical Honesty", desc: "No marketing fluff. Every claim we make is backed by lab data and athlete testimony." },
                { title: "Built to Last", desc: "We guarantee every suit for 500 hours of training. If it fails, we replace it. No questions." },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="p-7 rounded-3xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}
                >
                  <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-10">
            <a
              href="/shop"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 40px rgba(106,0,255,0.35)" }}
            >
              Shop the Collection →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
