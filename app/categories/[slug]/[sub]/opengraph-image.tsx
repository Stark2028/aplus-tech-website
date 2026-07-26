import { ImageResponse } from "next/og";
import { getVcRoomGuide } from "@/data/vcRoomGuides";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { sub } = await params;
  const guide = getVcRoomGuide(sub);

  return [
    {
      id: "og",
      alt: guide ? `${guide.navLabel} — Aplus Technology Solutions` : "Aplus Technology Solutions",
      size,
      contentType,
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { sub } = await params;
  const guide = getVcRoomGuide(sub);

  if (!guide) {
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
        Guide Not Found
      </div>,
      { ...size }
    );
  }

  // This route only ever serves Logitech VC guides, so the blue ramp is the
  // only theme — no education branch here (that lives on the category OG image).
  const theme = {
    bg: "linear-gradient(135deg, #050b15 0%, #0d1f40 60%, #0a1628 100%)",
    glow: "rgba(37, 99, 235, 0.18)",
    chipBg: "rgba(37,99,235,0.2)",
    chipBorder: "1px solid rgba(37,99,235,0.4)",
    chipText: "#93c5fd",
    label: "#60a5fa",
    pillBg: "rgba(37,99,235,0.15)",
    pillBorder: "1px solid rgba(37,99,235,0.3)",
    cta: "rgba(37,99,235,0.9)",
  };

  // Room guides carry a size band ("Huddle Rooms", "Large Rooms", ...);
  // platform guides (Teams/Zoom) don't, so fall back to the guide's own kind label.
  const secondaryLabel =
    guide.kind === "room" && guide.roomBands ? guide.roomBands.join(" / ") : "Platform Guide";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.bg,
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
          background: theme.glow,
          filter: "blur(80px)",
        }}
      />

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "auto" }}>
        <div
          style={{
            background: theme.chipBg,
            border: theme.chipBorder,
            color: theme.chipText,
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
          Video Conferencing
        </div>
      </div>

      {/* Guide size/kind label */}
      <div
        style={{
          color: theme.label,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {secondaryLabel}
      </div>

      {/* Headline */}
      <div
        style={{
          color: "#ffffff",
          fontSize: guide.navLabel.length > 30 ? 48 : 56,
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 28,
          maxWidth: 800,
        }}
      >
        {guide.navLabel}
      </div>

      {/* Body */}
      <div
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 18,
          lineHeight: 1.5,
          marginBottom: 32,
          maxWidth: 820,
        }}
      >
        {guide.subtitle}
      </div>

      {/* Guide-kind pill */}
      <div
        style={{
          background: theme.pillBg,
          border: theme.pillBorder,
          color: theme.chipText,
          padding: "10px 20px",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          // Satori (next/og) supports only flex/block/contents/none — NOT
          // inline-flex, which throws and fails the whole OG image. Use flex +
          // alignSelf:"flex-start" so the pill shrinks to its content (Satori
          // ignores width:"fit-content").
          display: "flex",
          alignItems: "center",
          alignSelf: "flex-start",
          marginBottom: 48,
        }}
      >
        {guide.kind === "room" ? "Room Sizing Guide" : "Platform Deployment Guide"}
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
            background: theme.cta,
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
          Explore Now →
        </div>
      </div>
    </div>,
    { ...size }
  );
}
