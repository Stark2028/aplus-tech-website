import { ImageResponse } from "next/og";
import { solutions } from "@/data/solutions";

export const alt = "Industry Solution — Samsung B2B Displays | Aplus Technology Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry } = await params;
  const solution = solutions.find((s) => s.slug === industry);

  if (!solution) {
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
          Industry Solution
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

      {/* Category label */}
      <div
        style={{
          // `For {title}` is two child nodes (text + expression); Satori requires
          // an explicit display on any element with >1 child or the OG image
          // fails to render entirely.
          display: "flex",
          color: "#60a5fa",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        For {solution.title}
      </div>

      {/* Solution title */}
      <div
        style={{
          color: "#ffffff",
          fontSize: solution.title.length > 30 ? 48 : 56,
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 28,
          maxWidth: 900,
        }}
      >
        {solution.title}
      </div>

      {/* Description */}
      <div
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 18,
          lineHeight: 1.5,
          marginBottom: 32,
          maxWidth: 820,
        }}
      >
        {solution.description}
      </div>

      {/* Recommended series pill */}
      <div style={{ display: "flex", gap: 8, marginBottom: 48, flexWrap: "wrap" }}>
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
          }}
        >
          Recommended:
        </div>
        {solution.recommendedSeries.slice(0, 3).map((series) => (
          <div
            key={series}
            style={{
              background: "rgba(37,99,235,0.15)",
              border: "1px solid rgba(37,99,235,0.3)",
              color: "#93c5fd",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            Samsung {series}
          </div>
        ))}
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
          Learn More →
        </div>
      </div>
    </div>,
    { ...size }
  );
}
