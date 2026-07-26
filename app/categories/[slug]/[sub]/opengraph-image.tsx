import { ImageResponse } from "next/og";
import { getVcRoomGuide } from "@/data/vcRoomGuides";
import { getEducationSegment } from "@/data/educationSegments";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Both kinds carry navLabel/subtitle; only "room" VC guides carry roomBands.
// A shared local shape keeps the render code below kind-agnostic.
function resolveOg(slug: string, sub: string) {
  if (slug === "education") {
    const segment = getEducationSegment(sub);
    return segment ? ({ kind: "education" as const, page: segment }) : null;
  }
  const guide = getVcRoomGuide(sub);
  return guide ? ({ kind: "vc" as const, page: guide }) : null;
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = await params;
  const found = resolveOg(slug, sub);

  return [
    {
      id: "og",
      alt: found ? `${found.page.navLabel} — Aplus Technology Solutions` : "Aplus Technology Solutions",
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
  const { slug, sub } = await params;
  const found = resolveOg(slug, sub);

  if (!found) {
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

  const { page } = found;
  const isEducation = found.kind === "education";

  // Education swaps the site-blue chrome for a Class Saathi emerald ramp —
  // same ramp as app/categories/[slug]/opengraph-image.tsx:69-80.
  const theme = isEducation
    ? {
        bg: "linear-gradient(135deg, #04140c 0%, #0b3a25 60%, #06281a 100%)",
        glow: "rgba(16,185,129,0.18)",
        chipBg: "rgba(16,185,129,0.2)",
        chipBorder: "1px solid rgba(16,185,129,0.4)",
        chipText: "#6ee7b7",
        label: "#34d399",
        pillBg: "rgba(16,185,129,0.15)",
        pillBorder: "1px solid rgba(16,185,129,0.3)",
        cta: "rgba(5,150,105,0.9)",
      }
    : {
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
  // platform guides and education segments don't, so guard the access —
  // education segments lack roomBands entirely, same as platform guides.
  const secondaryLabel =
    found.kind === "vc" && found.page.kind === "room" && found.page.roomBands
      ? found.page.roomBands.join(" / ")
      : isEducation
      ? "Class Saathi Guide"
      : "Platform Guide";

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
          {isEducation ? "Education" : "Video Conferencing"}
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
          fontSize: page.navLabel.length > 30 ? 48 : 56,
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 28,
          maxWidth: 800,
        }}
      >
        {page.navLabel}
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
        {page.subtitle}
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
        {isEducation
          ? "Class Saathi by TagHive"
          : found.kind === "vc" && found.page.kind === "room"
          ? "Room Sizing Guide"
          : "Platform Deployment Guide"}
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
