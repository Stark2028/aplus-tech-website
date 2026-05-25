import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";

const STATS = [
  { value: "500+", label: "Enterprise Clients" },
  { value: "7+", label: "Years in Business" },
  { value: "1,000+", label: "Installations Done" },
  { value: "100%", label: "Genuine Samsung" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#050b15]">
      {/* Preload the video poster — it's the LCP element until the video
          paints its first frame. Without this, browsers fetch posters at
          low priority. */}
      <link
        rel="preload"
        as="image"
        href="/images/hero-poster.webp"
        fetchPriority="high"
      />
      <video
        src="/videos/hero.mp4"
        poster="/images/hero-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, rgba(5,11,21,0.97) 0%, rgba(5,11,21,0.92) 40%, rgba(5,11,21,0.65) 70%, rgba(5,11,21,0.30) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-blue-950/20" />

      {/* Cinematic mesh gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-0 md:right-1/4 w-125 h-125 bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      <div className="relative flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center py-28 md:py-36">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-gray-300 text-sm font-semibold tracking-[0.2em] uppercase">
              Authorized Samsung Business Partner
            </span>
            <span
              className="h-px flex-1 max-w-13"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
          </div>

          <h1
            className="font-black text-white tracking-tight mb-8"
            style={{
              fontSize: "clamp(38px, 4.8vw, 72px)",
              lineHeight: "1.0",
              textShadow:
                "0 0 80px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.7)",
            }}
          >
            India&apos;s Premier
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #60a5fa 0%, #a5b4fc 100%)",
                whiteSpace: "nowrap",
              }}
            >
              Display Technology
            </span>
            <br />
            Partner
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <MagneticButton>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-colors"
                style={{ boxShadow: "0 8px 32px rgba(37,99,235,0.45)" }}
              >
                Request a Free Quote
                <ArrowRight size={18} />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 text-white px-8 py-4 rounded-xl font-bold text-base transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}
              >
                Browse Products
                <ArrowRight size={18} style={{ opacity: 0.45 }} />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </div>

      <div
        className="relative"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          backgroundColor: "rgba(5,11,21,0.6)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="flex-1 py-5 text-center"
                style={{
                  minWidth: "110px",
                  borderRight:
                    i < STATS.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                }}
              >
                <div className="text-2xl md:text-3xl font-black text-white">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-xs font-medium text-gray-500 mt-1">
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
