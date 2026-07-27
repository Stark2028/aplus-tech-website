import { ImageResponse } from "next/og";
import { getCityBySlug } from "@/data/cities";

export const alt = "Samsung Commercial Displays | Aplus Technology Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1526", color: "white", fontSize: 32, fontFamily: "sans-serif" }}>
          Location Not Found
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #050b15 0%, #0d1f40 60%, #0a1628 100%)", padding: "56px 64px", fontFamily: "system-ui, sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, borderRadius: "50%", background: "rgba(37, 99, 235, 0.18)", filter: "blur(80px)" }} />
        <div style={{ display: "flex", alignItems: "center", marginBottom: "auto" }}>
          <div style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.4)", color: "#93c5fd", padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
            Authorized Samsung Distributor
          </div>
        </div>
        {/* single-child div needs no explicit display, but keep it for Satori safety */}
        <div style={{ display: "flex", color: "#60a5fa", fontSize: 15, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
          {city.state}
        </div>
        <div style={{ color: "#ffffff", fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 28, maxWidth: 900, display: "flex" }}>
          Samsung Commercial Displays in {city.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 22 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 17, fontWeight: 500 }}>aplustechsol.com</div>
          <div style={{ background: "rgba(37,99,235,0.9)", color: "white", padding: "10px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center" }}>
            Get a Quote →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
