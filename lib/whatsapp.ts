/**
 * WhatsApp deep-linking utilities.
 *
 * One canonical phone number + a route-aware pre-filled message generator
 * shared by every WhatsApp entry point on the site (mobile sticky bar,
 * desktop chat widget, PDP inline button, etc).
 */

import { WHATSAPP_NUMBER } from "@/lib/contact";

/** Country code + number, no '+'. Used as wa.me path segment. Re-exported so
 *  existing `@/lib/whatsapp` imports keep resolving to the canonical value. */
export { WHATSAPP_NUMBER };

const DEFAULT_MSG =
  "Hi! I'm interested in Samsung display solutions for my business. Could you help?";

/** Pick a sensible pre-filled WhatsApp message based on the current path. */
export function getWhatsAppMessage(pathname: string): string {
  if (pathname.startsWith("/products/")) {
    const slug = pathname.replace("/products/", "").replace(/-/g, " ");
    return `Hi! I'm interested in the ${slug} and would like pricing details. Could you help?`;
  }
  if (pathname.startsWith("/categories/digital-signage"))
    return "Hi! I'm looking for Samsung digital signage solutions for my business. Could you share more details?";
  if (
    pathname.startsWith("/categories/video-wall") ||
    pathname.startsWith("/categories/video-walls")
  )
    return "Hi! I'm interested in Samsung video wall solutions. Could you help me with specifications and pricing?";
  if (pathname.startsWith("/categories/interactive"))
    return "Hi! I'm looking for Samsung interactive display solutions for meeting rooms or classrooms. Could you help?";
  if (pathname.startsWith("/categories/commercial-tv"))
    return "Hi! I'm looking for Samsung hospitality or commercial TV solutions. Could you share more details?";
  if (pathname.startsWith("/solutions/hospitality"))
    return "Hi! I need Samsung display solutions for my hospitality property. Could you help?";
  if (pathname.startsWith("/solutions/corporate"))
    return "Hi! I'm looking for Samsung display solutions for our corporate offices. Could you assist?";
  if (pathname.startsWith("/solutions/education"))
    return "Hi! I'm interested in Samsung display solutions for our educational institution. Could you help?";
  if (pathname.startsWith("/solutions/retail"))
    return "Hi! I need Samsung digital signage for our retail spaces. Could you share options and pricing?";
  if (pathname.startsWith("/quote"))
    return "Hi! I've submitted a quote request and would like to discuss it further. Could you help?";
  if (pathname.startsWith("/contact"))
    return "Hi! I'd like to speak with your sales team about Samsung display solutions.";
  return DEFAULT_MSG;
}

/** Build the full wa.me deep link for a given message. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Build a WhatsApp Web deep link. Used on desktop so a click opens the
 *  in-browser WhatsApp Web client directly, skipping the wa.me "Continue to
 *  Chat" interstitial that looks broken to visitors without the desktop app. */
export function buildWhatsAppWebUrl(message: string): string {
  return `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}
