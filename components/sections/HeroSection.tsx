import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Space_Grotesk, IBM_Plex_Mono, Caveat } from "next/font/google";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";
import DisplayStage from "@/components/sections/hero/DisplayStage";

// Hero-scoped premium type system (spec §4). Applied as CSS variables on the
// <section>: --font-display intentionally shadows the site-wide Plus Jakarta
// Sans inside the hero subtree (phase 2 decides the site-wide swap).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-hand",
  display: "swap",
  preload: false,
});

const STATS = [
  { value: "500+", label: "Enterprise Clients" },
  { value: "5+", label: "Years in Business" },
  { value: "10,000+", label: "Installations Done" },
  { value: "100%", label: "Genuine Samsung" },
];

export default function HeroSection() {
  return (
    <section
      className={`${spaceGrotesk.variable} ${plexMono.variable} ${caveat.variable} hero2 relative min-h-[88vh] flex flex-col overflow-hidden`}
    >
      {/* Layered backdrop: pixel-dot field, drifting auroras, film grain,
          bottom vignette — all CSS, no images (stage.css `hero2-*`). */}
      <div className="hero2-dots" aria-hidden="true" />
      <div className="hero2-aur hero2-aur-a" aria-hidden="true" />
      <div className="hero2-aur hero2-aur-b" aria-hidden="true" />
      <div className="hero2-noise" aria-hidden="true" />
      <div className="hero2-vignette" aria-hidden="true" />

      <div className="relative z-[2] flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 md:py-16 grid items-center gap-10 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="hero2-badge hero2-rise mb-5" style={{ animationDelay: "0.15s" }}>
            Authorized Samsung Business Partner
          </div>

          <h1
            className="font-bold text-white mb-6"
            style={{
              fontSize: "clamp(36px, 4.8vw, 72px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em",
            }}
          >
            <span className="md:drop-shadow-[0_0_80px_rgba(0,0,0,0.9)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              <span className="hero-word" style={{ animationDelay: "0.3s" }}>India&apos;s Premier</span>
              <br />
              <span
                className="hero-word hero2-grad sm:whitespace-nowrap"
                style={{
                  animationDelay: "0.45s",
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
              <span className="hero-word" style={{ animationDelay: "0.6s" }}>Partner</span>
            </span>
            {/* Keyword-rich context for crawlers without altering the visual headline. */}
            <span className="sr-only">
              {" "}— Authorized Samsung distributor for digital signage, video walls,
              interactive displays, and hospitality TVs across India.
            </span>
          </h1>

          {/* Visible supporting paragraph: gives the hero indexable body copy
              with the primary keywords search engines rank this page on. */}
          <p
            className="hero2-sub hero2-rise text-base md:text-lg mb-7 max-w-xl leading-relaxed"
            style={{ animationDelay: "0.75s" }}
          >
            Authorized Samsung distributor for{" "}
            <strong className="font-semibold">Smart Signage</strong>,{" "}
            <strong className="font-semibold">Video Walls</strong>,{" "}
            <strong className="font-semibold">Interactive Displays</strong>, and{" "}
            <strong className="font-semibold">Hospitality TVs</strong> —
            with certified installation and support across India.
          </p>

          <div className="hero2-rise flex flex-col sm:flex-row gap-3" style={{ animationDelay: "0.9s" }}>
            <MagneticButton>
              <Link
                href="/quote"
                className="hero2-cta hero2-disp inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-full font-bold text-base transition-colors"
                style={{ boxShadow: "0 8px 32px rgba(37,99,235,0.45)" }}
              >
                Request a Free Quote
                <ArrowRight size={18} />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/products"
                className="hero2-cta2 hero2-disp inline-flex items-center justify-center gap-2.5 text-white px-7 py-3.5 rounded-full font-bold text-base"
              >
                Browse Products
                <ArrowRight size={18} style={{ opacity: 0.45 }} />
              </Link>
            </MagneticButton>
          </div>
        </div>

        {/* The stage: renders beside the copy on lg+, below the CTAs on
            smaller viewports (single-column grid flow). */}
        <DisplayStage />
      </div>

      {/* Stats bar — horizontal scroll pill strip on mobile, even 4-col row on desktop */}
      <div className="relative z-[2] bg-[#04060d]/90 md:bg-[#04060d]/65 md:backdrop-blur-md border-t border-white/5">
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
