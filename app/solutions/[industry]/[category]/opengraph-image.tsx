import { ImageResponse } from "next/og";
import { useCaseCombos } from "@/data/useCaseCombos";

export const alt = "Industry + Category Solution — Samsung B2B Displays | Aplus Technology Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ industry: string; category: string }>;
}) {
  const { industry, category } = await params;
  const combo = useCaseCombos.find((c) => c.industry === industry && c.category === category);

  if (!combo) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1526",
          color: "white",
          fontSize: 32,
          fontFamily: "sans-serif",
        }}
      >
        Solution Not Found
      </div>,
      { ...size }
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #050b15 0%, #0d1f40 60%, #0a1628 100%)",
        padding: "56px 64px",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(37, 99, 235, 0.18)",
          filter: "blur(80px)",
        }}
      />

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "auto" }}>
        <div
          style={{
            background: "rgba(37,99,235,0.2)",
            border: "1px solid rgba(37,99,235,0.4)",
            color: "#93c5fd",
            padding: "6px 16px",
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
          }}
        >
          Specialized Solution
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#9ca3af",
            padding: "6px 14px",
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
          }}
        >
          Samsung Displays
        </div>
      </div>

      {/* Breadcrumb-style context */}
      <div
        style={{
          // `{industry} · {category}` is three child nodes; Satori requires an
          // explicit display on any element with >1 child or the OG image fails
          // to render entirely.
          display: "flex",
          color: "#60a5fa",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {combo.industry} · {combo.category}
      </div>

      {/* Combo title */}
      <div
        style={{
          color: "#ffffff",
          fontSize: combo.title.length > 35 ? 40 : 50,
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 28,
          maxWidth: 900,
        }}
      >
        {combo.title}
      </div>

      {/* Intro/description */}
      <div
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 17,
          lineHeight: 1.6,
          marginBottom: 32,
          maxWidth: 820,
        }}
      >
        {combo.intro}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 22,
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 17, fontWeight: 500 }}>
          aplustechsol.com
        </div>
        <div
          style={{
            background: "rgba(37,99,235,0.9)",
            color: "white",
            padding: "10px 24px",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Discover →
        </div>
      </div>
    </div>,
    { ...size }
  );
}
