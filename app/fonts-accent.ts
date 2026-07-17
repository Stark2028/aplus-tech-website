import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

// Shared "accent" families used by the hero (via CSS variables) and the
// product card (via .className directly on elements). --font-display here
// deliberately shadows the site-wide Plus Jakarta Sans ONLY where .variable
// is applied (the hero <section>); the card never touches the variables.
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
