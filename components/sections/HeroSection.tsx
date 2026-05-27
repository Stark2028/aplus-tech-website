import Image from "next/image";
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
    <section className="relative min-h-[88vh] flex flex-col overflow-hidden bg-[#050b15]">
      {/* Background image of real digital signage. `priority` makes Next.js
          preload it at high fetch priority — it's behind the dark gradient,
          so a moderate WebP quality keeps it light without visible loss. */}
      <Image
        src="/images/hero-signage.webp"
        alt="Digital signage displays in a modern commercial space"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Primary left-to-right gradient anchors the white headline on the
          dark left side; kept darker on the right (0.55) so the busy kiosk /
          wayfinding signage recedes instead of competing with the CTAs. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, rgba(5,11,21,0.97) 0%, rgba(5,11,21,0.93) 40%, rgba(5,11,21,0.78) 70%, rgba(5,11,21,0.55) 100%)",
        }}
      />
      {/* Bottom-right vignette to settle the bright "automated check-in"
          kiosk that was pulling the eye in the corner. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 120% at 100% 100%, rgba(5,11,21,0.6) 0%, rgba(5,11,21,0) 55%)",
        }}
      />
      <div className="absolute inset-0 bg-blue-950/20" />

      {/* Cinematic mesh gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-0 md:right-1/4 w-125 h-125 bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

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
                  "linear-gradient(90deg, #3b82f6 0%, #60a5fa 45%, #c4b5fd 100%)",
                whiteSpace: "nowrap",
              }}
            >
              Display Technology
            </span>
            <br />
            Partner
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
        className="relative"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          backgroundColor: "rgba(5,11,21,0.65)",
          backdropFilter: "blur(14px)",
        }}
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
