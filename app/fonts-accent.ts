import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

// Shared "accent" families for the hero and the product card.
//
// SERVER-GRAPH ONLY: never import this module from a "use client" file.
// With .browserslistrc present, Turbopack's client-graph next/font transform
// fails ("Font loader calls must be assigned to a const" — vercel/next.js
// #86792), so client components must consume these fonts through the CSS
// variables that app/layout.tsx puts on <body> (--font-card-*) instead of
// importing .className here.

// Hero instances: --font-display deliberately shadows the site-wide Plus
// Jakarta Sans inside the hero <section> subtree only.
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
});

// Card-scoped duplicates of the same families under non-colliding variable
// names, applied on <body> so ProductCard (client) can use
// font-family: var(--font-card-*) without importing next/font. Identical
// font config means the self-hosted font files are shared, not re-downloaded.
export const spaceGroteskCard = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-card-display",
  display: "swap",
});

export const plexMonoCard = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-card-mono",
  preload: false,
});
