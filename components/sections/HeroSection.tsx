import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";

const STATS = [
  { value: "500+", label: "Enterprise Clients" },
  { value: "5+", label: "Years in Business" },
  { value: "10,000+", label: "Installations Done" },
  { value: "100%", label: "Genuine Samsung" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex flex-col overflow-hidden bg-[#050b15]">
      {/* Unified deep-navy background (no photo — it was invisible under the
          dark overlay, so it's dropped to save the image fetch). A subtle
          left→right gradient gives the white headline a darker anchor. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, #03070e 0%, #050b15 55%, #060d1a 100%)",
        }}
      />
      {/* Mobile glow orbs — mirror the headline's blue→violet gradient, dimmed so the section reads dark */}
      <div className="md:hidden absolute inset-0 overflow-hidden">
        {/* Primary orb: deep royal blue */}
        <div className="absolute top-[-8%] left-[5%] w-96 h-96 bg-blue-700 rounded-full filter blur-[110px] opacity-40 animate-slow-glow pointer-events-none" />
        {/* Secondary orb: rich violet — matches headline gradient end (#c4b5fd) */}
        <div className="absolute bottom-[5%] right-[2%] w-80 h-80 bg-violet-600 rounded-full filter blur-[110px] opacity-35 animate-slow-glow-delayed pointer-events-none" />
        {/* Faint indigo mid-layer for depth */}
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-indigo-700 rounded-full filter blur-[130px] opacity-25 pointer-events-none" />
      </div>

      {/* ── Desktop premium gradient effects ────────────────────────────── */}
      {/* Top-edge aurora sweep: a faint band of colour along the very top */}
      <div
        className="hidden md:block absolute top-0 left-0 right-0 h-[420px] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(79,70,229,0.06) 40%, transparent 100%)",
        }}
      />
      {/* Primary blue orb — behind the text, dimmed to a faint key light */}
      <div className="hidden md:block absolute top-[-5%] left-[-4%] w-[36rem] h-[36rem] bg-blue-600 rounded-full blur-[160px] opacity-[0.14] animate-slow-glow pointer-events-none" />
      {/* Violet accent — bottom-centre creates depth under the CTA buttons */}
      <div className="hidden md:block absolute bottom-[-10%] left-[25%] w-[28rem] h-[28rem] bg-violet-600 rounded-full blur-[180px] opacity-[0.10] animate-slow-glow-delayed pointer-events-none" />
      {/* Cyan glint — top-right edge, subtle highlight that catches the eye */}
      <div className="hidden md:block absolute top-[10%] right-[8%] w-72 h-72 bg-cyan-500 rounded-full blur-[140px] opacity-[0.08] animate-slow-glow pointer-events-none" />

      <div className="relative flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center py-10 md:py-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-gray-300 text-xs font-semibold tracking-[0.18em] uppercase">
              Authorized Samsung Business Partner
            </span>
          </div>

          <h1
            className="font-black text-white tracking-tight mb-6"
            style={{
              fontSize: "clamp(36px, 4.8vw, 72px)",
              lineHeight: "1.05",
            }}
          >
            {/* Added a text-shadow drop for desktop only to improve mobile LCP */}
            <span className="md:drop-shadow-[0_0_80px_rgba(0,0,0,0.9)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              <span className="hero-word" style={{ animationDelay: "0s" }}>India&apos;s</span>{" "}
              <span className="hero-word" style={{ animationDelay: "0.04s" }}>Premier</span>
              <br />
              <span
                className="hero-word text-transparent bg-clip-text sm:whitespace-nowrap"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #3b82f6 0%, #60a5fa 45%, #c4b5fd 100%)",
                  animationDelay: "0.08s",
                  // bg-clip-text + tight line-height clips descenders (p, y, g).
                  // Add a little vertical room and offset it so line spacing
                  // stays visually unchanged.
                  lineHeight: 1.18,
                  paddingBottom: "0.08em",
                  marginBottom: "-0.08em",
                }}
              >
                Display Technology
              </span>
              <br />
              <span className="hero-word" style={{ animationDelay: "0.12s" }}>Partner</span>
            </span>
            {/* Keyword-rich context for crawlers without altering the visual headline. */}
            <span className="sr-only">
              {" "}— Authorized Samsung distributor for digital signage, video walls,
              interactive displays, and hospitality TVs across India.
            </span>
          </h1>

          {/* Visible supporting paragraph: gives the hero indexable body copy
              with the primary keywords search engines rank this page on. */}
          <p className="text-base md:text-lg text-gray-300 mb-7 max-w-xl leading-relaxed">
            Authorized Samsung distributor for{" "}
            <strong className="font-semibold text-white">Smart Signage</strong>,{" "}
            <strong className="font-semibold text-white">Video Walls</strong>,{" "}
            <strong className="font-semibold text-white">Interactive Displays</strong>, and{" "}
            <strong className="font-semibold text-white">Hospitality TVs</strong> —
            with certified installation and support across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <MagneticButton>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-bold text-base transition-colors"
                style={{ boxShadow: "0 8px 32px rgba(37,99,235,0.45)" }}
              >
                Request a Free Quote
                <ArrowRight size={18} />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 text-white px-7 py-3.5 rounded-xl font-bold text-base transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}
              >
                Browse Products
                <ArrowRight size={18} style={{ opacity: 0.45 }} />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Stats bar — horizontal scroll pill strip on mobile, even 4-col row on desktop */}
      <div
        className="relative bg-[#050b15]/90 md:bg-[#050b15]/65 md:backdrop-blur-md border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex-1 py-4 md:py-5 text-center ${i < STATS.length - 1 ? "border-r border-white/8" : ""}`}
              >
                <div className="text-xl md:text-3xl font-black text-white leading-none">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-[10px] md:text-xs font-medium text-gray-500 mt-1 px-1 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
